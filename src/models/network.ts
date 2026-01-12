import type { NetworkSummary } from "@/typings/data-contracts";
import type { DockerComposeConfig } from "./docker-compose-schema";
import { Networks as NetworksApi } from "@/typings/Networks";
import type { Project } from "./project";
import { Container } from "./container";
import { DOCKER_SOCKET_BASE_URL } from "astro:env/server";

export class Network {
  private readonly _containers: Set<Container> = new Set();

  constructor(
    public readonly name: string,
    private readonly dockerCompose?: {
      project: Project;
      config: NonNullable<DockerComposeConfig["networks"]>[string];
    },
    private readonly instance?: NetworkSummary
  ) {}

  get project(): Project | undefined {
    return this.dockerCompose?.project;
  }

  get containers(): Container[] {
    return Array.from(this._containers);
  }

  get isExternal(): boolean {
    return this.dockerCompose?.config.external === true;
  }

  get isRunning(): boolean {
    return this.instance !== undefined;
  }

  get createdOn(): Date | undefined {
    return this.instance?.Created ? new Date(this.instance.Created) : undefined;
  }

  addContainer(container: Container) {
    this._containers.add(container);
  }

  static async getAll(projects: Project[]): Promise<Network[]> {
    // Actual running networks
    const instances = (await this.getListOfNetworkInstances()).map((instance) => {
      return {
        project: projects.find(
          (project) => project.name === instance.Labels?.["com.docker.compose.project"]
        ),
        instance: instance,
        name: instance.Name!,
      };
    });
    // Networks defined in docker-compose.yml > networks section
    const composeNetworks = projects.flatMap((project) => {
      return Object.entries(project.dockerCompose?.networks ?? {})
        .filter(([_, config]) => config.external !== true)
        .map(([name, config]) => ({
          project,
          name: config.name ?? `${project.name}_${name}`,
          config,
        }));
    });

    // Find projects where at least one service uses the default project network
    const defaultNetworks = projects.flatMap((project) => {
      const services = Object.values(project.dockerCompose?.services ?? {});
      const useDefaultNetwork = services.some((service) => {
        if (!service.networks) return true;
        if (Array.isArray(service.networks)) return service.networks.length === 0;
        return Object.keys(service.networks).length === 0;
      });
      return useDefaultNetwork
        ? [
            {
              project,
              name: `${project.name}_default`,
              config: {},
            },
          ]
        : [];
    });

    const uniqueNames = new Set([
      ...instances.map((instance) => instance.name),
      ...composeNetworks.map((network) => network.name),
      ...defaultNetworks.map((network) => network.name),
    ]);
    return Array.from(uniqueNames).map((name) => {
      const dockerCompose =
        composeNetworks.find((network) => network.name === name && network.config) ??
        defaultNetworks.find((network) => network.name === name);
      const instance = instances.find((network) => network.name === name)?.instance;
      return new Network(name, dockerCompose, instance);
    });
  }

  private static async getListOfNetworkInstances(): Promise<NetworkSummary[]> {
    const networksApi = new NetworksApi();
    const { data: networks } = await networksApi.networkList(
      {},
      { baseUrl: DOCKER_SOCKET_BASE_URL }
    );
    return networks;
  }
}
