import fg from "fast-glob";
import YAML from "yaml";
import { readFile } from "node:fs/promises";
import {
  dockerComposeConfigSchema,
  type DockerComposeConfig,
} from "./docker-compose-schema";
import type { ZodError } from "zod";
import { Containers } from "@/typings/Containers";
import { Networks } from "@/typings/Networks";
import { Volumes } from "@/typings/Volumes";
import type { Container } from "./container";
import type { Network } from "./network";
import type { Volume } from "./volume";

type Config = {
  path: string;
  content?: string;
  error?: ZodError;
  parsed?: DockerComposeConfig;
};

export class Project {
  private readonly config: Config | undefined;
  private _networks: Set<Network> = new Set();
  private _containers: Set<Container> = new Set();
  private _volumes: Set<Volume> = new Set();

  private constructor(
    public readonly name: string,
    config?: Pick<Config, "path" | "content"> | undefined
  ) {
    this.config = config;
    if (this.config?.content) {
      const parsed = dockerComposeConfigSchema.safeParse(
        YAML.parse(this.config.content, { merge: true })
      );
      this.config.parsed = parsed.data;
      this.config.error = parsed.error;
    }
  }

  get networks(): Network[] {
    return Array.from(this._networks);
  }
  get containers(): Container[] {
    return Array.from(this._containers);
  }
  get volumes(): Volume[] {
    return Array.from(this._volumes);
  }

  addNetwork(network: Network) {
    this._networks.add(network);
  }
  addContainer(container: Container) {
    this._containers.add(container);
  }
  addVolume(volume: Volume) {
    this._volumes.add(volume);
  }

  get isRunning(): boolean {
    return this.containers.some((container) => container.isRunning);
  }

  get dockerComposeFilePath(): string | undefined {
    return this.config?.path;
  }

  get dockerComposeFileContent(): string | undefined {
    return this.config?.content;
  }

  get dockerCompose(): DockerComposeConfig | undefined {
    return this.config?.parsed;
  }

  static async getAll(): Promise<Project[]> {
    const runningProjects = await this.getListOfRunningProjects();
    const dockerComposePaths = await this.getListOfDockerComposePaths();
    const dockerComposeConfigs = await Promise.all(
      dockerComposePaths.map(async (path) => {
        const content = await readFile(path, "utf8");
        return {
          name: this.getProjectNameFromPath(path),
          path,
          content,
        };
      })
    );

    const projectNames = new Set([
      ...runningProjects,
      ...dockerComposeConfigs.map(({ name }) => name),
    ]);

    return Promise.all(
      Array.from(projectNames).map(async (name) => {
        const config = dockerComposeConfigs.find(
          (config) => config.name === name
        );
        return new Project(
          name,
          config
            ? {
                path: config.path,
                content: config.content,
              }
            : undefined
        );
      })
    );
  }

  private static async getListOfRunningProjects(): Promise<string[]> {
    const [containers, networks, volumes] = await Promise.all([
      new Containers().containerList(
        { all: true },
        { baseUrl: "http://localhost:2375" }
      ),
      new Networks().networkList({}, { baseUrl: "http://localhost:2375" }),
      new Volumes().volumeList({}, { baseUrl: "http://localhost:2375" }),
    ]);

    const ressources = [
      ...containers.data,
      ...networks.data,
      ...(volumes.data?.Volumes ?? []),
    ];
    return Array.from(
      new Set(
        ressources.flatMap(
          (ressource) => ressource.Labels?.["com.docker.compose.project"] ?? []
        )
      )
    );
  }

  private static async getListOfDockerComposePaths(): Promise<string[]> {
    return await fg("**/docker-compose.{yml,yaml}", {
      cwd: "/services",
      followSymbolicLinks: false,
      absolute: true,
      deep: 3,
      ignore: ["**/node_modules/**", "**/.git/**"],
      suppressErrors: true,
    });
  }

  private static getProjectNameFromPath(path: string) {
    const parts = path.split("/");
    return parts[parts.length - 2].replaceAll(".", "");
  }
}
