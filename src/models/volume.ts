import type { DockerComposeConfig } from "./docker-compose-schema";
import type { Volume as VolumeSummary } from "@/typings/data-contracts";
import { Volumes as VolumesApi } from "@/typings/Volumes";
import type { Project } from "./project";
import { DOCKER_SOCKET_BASE_URL } from "astro:env/server";

export class Volume {
  constructor(
    public readonly name: string,
    private readonly dockerCompose?: {
      project: Project;
      config: NonNullable<DockerComposeConfig["volumes"]>[string];
    },
    public readonly instance?: VolumeSummary
  ) {}

  get project(): Project | undefined {
    return this.dockerCompose?.project;
  }

  get createdOn(): Date | undefined {
    return this.instance?.CreatedAt
      ? new Date(this.instance.CreatedAt)
      : undefined;
  }

  static async getAll(projects: Project[]): Promise<Volume[]> {
    const instances = await this.getListOfVolumeInstances();

    const volumes = projects.flatMap((project) => {
      return Object.entries(project.dockerCompose?.volumes ?? {}).map(
        ([name, config]) => ({
          project,
          name: config?.name ?? `${project.name}_${name}`,
          config,
        })
      );
    });

    const uniqueNames = new Set([
      ...instances.map((instance) => instance.Name),
      ...volumes.map((volume) => volume.name),
    ]);

    return Array.from(uniqueNames).map((volumeName) => {
      const dockerCompose = volumes.find(
        (volume) => volume.name === volumeName
      );
      const instance = instances.find(
        (instance) => instance.Name === volumeName
      );
      return new Volume(volumeName, dockerCompose, instance);
    });
  }

  private static async getListOfVolumeInstances(): Promise<VolumeSummary[]> {
    const volumesApi = new VolumesApi();
    const { data: volumes } = await volumesApi.volumeList(
      {},
      { baseUrl: DOCKER_SOCKET_BASE_URL }
    );
    return volumes.Volumes ?? [];
  }
}
