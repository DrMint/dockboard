import type { ContainerSummary } from "@/typings/data-contracts";
import type { DockerComposeConfig } from "./docker-compose-schema";
import { Containers as ContainersApi } from "@/typings/Containers";
import { Project } from "./project";
import { Network } from "./network";
import { Image, type ParsedImageRef } from "./image";
import { DOCKER_SOCKET_BASE_URL } from "astro:env/server";

export class Container {
  private readonly _networks: Set<Network> = new Set();
  private _image: Image | undefined = undefined;

  constructor(
    public readonly name: string,
    public readonly serviceName: string,
    private readonly dockerCompose?: {
      project: Project;
      config: DockerComposeConfig["services"][string];
    },
    private readonly instance?: ContainerSummary
  ) { }

  get image(): Image | undefined {
    return this._image;
  }

  setImage(image: Image) {
    this._image = image;
  }

  get imageId(): string | undefined {
    return this.instance?.ImageID;
  }

  get imageRef(): ParsedImageRef | undefined {
    if (this.dockerCompose) {
      return Image.getImageRefFromCompose(this.dockerCompose.project, this.serviceName, this.dockerCompose.config);
    }
  }

  get networks(): Network[] {
    return Array.from(this._networks);
  }

  addNetwork(network: Network) {
    this._networks.add(network);
  }

  get project(): Project | undefined {
    return this.dockerCompose?.project;
  }

  get isRunning(): boolean {
    return this.instance?.State === "running";
  }

  get state(): NonNullable<ContainerSummary["State"]> | "down" {
    return this.instance?.State ?? "down";
  }

  get createdOn(): Date | undefined {
    return this.instance?.Created ? new Date(this.instance.Created) : undefined;
  }

  get ports(): string[] {
    const ports = this.dockerCompose?.config.ports;
    if (!ports) return [];
    return ports.map((port) =>
      typeof port === "string" ? port.split(":")[0] : `${port.published}`
    );
  }

  get dependsOn(): string[] {
    const dependsOn = this.dockerCompose?.config.depends_on;
    if (!dependsOn) return [];
    if (Array.isArray(dependsOn)) return dependsOn;
    return Object.keys(dependsOn);
  }

  get mounts(): string[] {
    const mounts = this.dockerCompose?.config.volumes;
    if (!mounts) return [];
    return mounts.map((mount) => mount.split(":")[0]);
  }

  get networkNames(): string[] {
    const networksFromInstance = this.instance?.NetworkSettings?.Networks
      ? Object.keys(this.instance.NetworkSettings.Networks)
      : [];

    return Array.from(
      new Set([
        ...networksFromInstance,
        ...Container.getNetworkNamesFromDockerCompose(this.dockerCompose),
      ])
    );
  }

  static async getAll(projects: Project[]): Promise<Container[]> {
    const instances = (await this.getListOfContainerInstances()).map(
      (instance) => {
        return {
          project: projects.find(
            (project) =>
              project.name === instance.Labels?.["com.docker.compose.project"]
          ),
          instance: instance,
          name: instance.Names![0].slice(1),
          serviceName: instance.Labels?.["com.docker.compose.service"] ?? "",
        };
      }
    );
    const services = projects.flatMap((project) => {
      return Object.entries(project.dockerCompose?.services ?? {}).map(
        ([name, config]) => ({
          project,
          name: config.container_name ?? `${project.name}-${name}-1`,
          serviceName: name,
          config,
        })
      );
    });
    const uniqueNames = new Set([
      ...instances.map((container) => container.name),
      ...services.map((service) => service.name),
    ]);
    return Array.from(uniqueNames).map((name) => {
      const dockerCompose = services.find((service) => service.name === name);
      const instance = instances.find((container) => container.name === name);
      return new Container(
        name,
        instance?.serviceName ?? dockerCompose?.serviceName ?? name,
        dockerCompose,
        instance?.instance
      );
    });
  }

  static getNetworkNamesFromDockerCompose(dockerCompose?: {
    project: Project;
    config: DockerComposeConfig["services"][string];
  }): string[] {
    if (!dockerCompose) return [];
    const networksFromDockerCompose = dockerCompose
      ? Array.isArray(dockerCompose.config.networks)
        ? dockerCompose.config.networks
        : Object.keys(dockerCompose.config.networks ?? {})
      : [];
    const defaultNetwork =
      networksFromDockerCompose.length === 0
        ? [`${dockerCompose.project.name}_default`]
        : [];
    return Array.from(
      new Set([...networksFromDockerCompose, ...defaultNetwork])
    );
  }

  private static async getListOfContainerInstances(): Promise<
    ContainerSummary[]
  > {
    const containersApi = new ContainersApi();
    const { data: containers } = await containersApi.containerList(
      {
        all: true,
      },
      { baseUrl: DOCKER_SOCKET_BASE_URL }
    );
    return containers;
  }
}
