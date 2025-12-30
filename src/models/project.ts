import fg from "fast-glob";
import YAML from "yaml";
import { readFile } from "node:fs/promises";
import {
  dockerComposeConfigSchema,
  type DockerComposeConfig,
} from "./docker-compose-schema";
import type { ZodError } from "zod";
import { Containers as ContainersApi } from "@/typings/Containers";
import { Networks as NetworksApi } from "@/typings/Networks";
import { Volumes as VolumesApi } from "@/typings/Volumes";
import type {
  ContainerSummary,
  NetworkSummary,
  Volume as VolumeSummary,
} from "@/typings/data-contracts";
import { Container } from "./container";
import { Network } from "./network";
import { Volume } from "./volume";

type CheckResult = {
  message: string;
  level: "error" | "warning" | "info";
};

export type RunningResources = {
  containers: ContainerSummary[];
  networks: NetworkSummary[];
  volumes: VolumeSummary[];
};

export class Project {
  config: DockerComposeConfig | null = null;
  configError: ZodError | null = null;
  containers: Container[] = [];
  networks: Network[] = [];
  volumes: Volume[] = [];

  private constructor(
    public readonly name: string,
    public readonly dockerComposeFileContent: string | null,
    public readonly dockerComposeFilePath: string | null,
    private readonly runningResources: RunningResources
  ) {
    if (this.dockerComposeFileContent) {
      const config = dockerComposeConfigSchema.safeParse(
        YAML.parse(this.dockerComposeFileContent, { merge: true })
      );
      if (config.success) {
        this.config = config.data;
      } else {
        this.configError = config.error;
      }
    }

    /* Containers */

    {
      const runningContainers = this.runningResources.containers.filter(
        (network) => network.Labels?.[`com.docker.compose.project`] === name
      );
      const runningContainerNames = runningContainers.map((container) =>
        container.Names![0].slice(1)
      );
      const configContainers = Object.keys(this.config?.services ?? {});
      const uniqueNames = new Set([
        ...configContainers,
        ...runningContainerNames,
      ]);
      this.containers = Array.from(uniqueNames).map((name) => {
        const runningContainer = runningContainers.find(
          (container) => container.Names![0].slice(1) === name
        );
        return new Container(
          name,
          { name: this.name, config: this.config },
          this.config?.services?.[name],
          runningContainer
        );
      });
    }

    /* Networks */
    {
      const networkNames = this.containers
        .map((container) => container.networks)
        .flat();

      const uniqueNames = new Set(networkNames);

      this.networks = Array.from(uniqueNames).map(
        (name) =>
          new Network(
            name,
            {
              name: this.name,
              config: this.config,
              runningResources: this.runningResources,
            },
            this.config?.networks?.[name],
            this.runningResources.networks.find(
              (network) => network.Name === name
            )
          )
      );
    }

    /* Volumes */
    {
      const runningVolumes = this.runningResources.volumes.filter(
        (volume) => volume.Labels?.[`com.docker.compose.project`] === name
      );
      const runningVolumeNames = runningVolumes.map((volume) => volume.Name);
      const configVolumeNames = Object.keys(this.config?.volumes ?? {}).map(
        (volume) => this.config?.volumes?.[volume]?.name ?? volume
      );
      const uniqueNames = new Set([
        ...configVolumeNames,
        ...runningVolumeNames,
      ]);
      this.volumes = Array.from(uniqueNames).map((name) => {
        const runningVolume = runningVolumes.find(
          (volume) => volume.Name === name
        );
        return new Volume(name, this.config?.volumes?.[name], runningVolume);
      });
    }
  }

  get isRunning(): boolean {
    return this.containers.some((container) => container.isRunning);
  }

  configLinter(): CheckResult[] {
    const config = this.config;

    if (!config) {
      return [
        {
          message: "The config is not valid",
          level: "error",
        },
      ];
    }

    const results: CheckResult[] = [];

    Object.keys(config.services ?? {}).forEach((service) => {
      // Check that all services have a container_name attribute
      if (!config.services[service].container_name) {
        results.push({
          message: `Service ${service} is missing a required container_name attribute`,
          level: "error",
        });
      }
      // Check that the container_name attribute is the same as the service name
      else if (config.services[service].container_name !== service) {
        results.push({
          message: `Service ${service} has a container_name attribute which is not the same as the service name`,
          level: "error",
        });
      }

      // Give a warning if ports are exposed
      if (config.services[service].ports) {
        results.push({
          message: `Service ${service} is exposing ports, consider using a network instead`,
          level: "info",
        });
      }

      // Give a warning if no user is specified
      if (!config.services[service].user) {
        results.push({
          message: `Service ${service} is not specifying a user, consider using a user to run the container`,
          level: "warning",
        });
      }

      // Give a warning if no cpu limit is specified
      if (!config.services[service].cpus) {
        results.push({
          message: `Service ${service} is not specifying a cpu limit, consider using a cpu limit to run the container`,
          level: "warning",
        });
      }

      // Give a warning if no memory limit is specified
      if (!config.services[service].mem_limit) {
        results.push({
          message: `Service ${service} is not specifying a memory limit, consider using a memory limit to run the container`,
          level: "warning",
        });
      }

      // Give a warning if no pid limit is specified
      if (!config.services[service].pids_limit) {
        results.push({
          message: `Service ${service} is not specifying a pid limit, consider using a pid limit to run the container`,
          level: "warning",
        });
      }
    });

    // Sort the result such that errors are first, then warnings, then info
    return results.toSorted((a, b) => {
      const aValue = a.level === "error" ? 3 : a.level === "warning" ? 2 : 1;
      const bValue = b.level === "error" ? 3 : b.level === "warning" ? 2 : 1;
      return bValue - aValue;
    });
  }

  static async getRunningResources(): Promise<RunningResources> {
    const containerApi = new ContainersApi();
    const { data: containersData } = await containerApi.containerList(
      { all: true },
      { baseUrl: "http://localhost:2375" }
    );

    const networkApi = new NetworksApi();
    const { data: networksData } = await networkApi.networkList(
      {},
      { baseUrl: "http://localhost:2375" }
    );

    const volumesApi = new VolumesApi();
    const { data: volumesData } = await volumesApi.volumeList(
      {},
      { baseUrl: "http://localhost:2375" }
    );

    return {
      containers: containersData,
      networks: networksData,
      volumes: volumesData.Volumes ?? [],
    };
  }

  static async fromName(name: string): Promise<Project> {
    const dockerComposeFiles = await this.getListOfDockerComposeFiles();
    const dockerComposeFile =
      dockerComposeFiles.find(
        (file) => this.getProjectNameFromPath(file) === name
      ) ?? null;
    const dockerComposeFileContent = dockerComposeFile
      ? await readFile(dockerComposeFile, "utf8")
      : null;
    return new Project(
      name,
      dockerComposeFileContent,
      dockerComposeFile,
      await this.getRunningResources()
    );
  }

  static async getAllProjects(): Promise<Project[]> {
    const dockerComposeFiles = await this.getListOfDockerComposeFiles();
    return Promise.all(
      dockerComposeFiles.map(
        async (file) =>
          new Project(
            this.getProjectNameFromPath(file),
            await readFile(file, "utf8"),
            file,
            await this.getRunningResources()
          )
      )
    );
  }

  private static async getListOfDockerComposeFiles(): Promise<string[]> {
    return await fg("**/docker-compose.{yml,yaml}", {
      cwd: "/services",
      followSymbolicLinks: false,
      absolute: true,
      deep: 3,
      ignore: ["**/node_modules/**", "**/.git/**"],
      suppressErrors: true,
    });
  }

  static getProjectNameFromPath(path: string) {
    const parts = path.split("/");
    return parts[parts.length - 2].replaceAll(".", "");
  }
}
