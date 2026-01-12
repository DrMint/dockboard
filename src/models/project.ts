import fg from "fast-glob";
import YAML from "yaml";
import { readFile } from "node:fs/promises";
import { dockerComposeConfigSchema, type DockerComposeConfig } from "./docker-compose-schema";
import type { ZodError } from "zod";
import { Containers } from "@/typings/Containers";
import { Networks } from "@/typings/Networks";
import { Volumes } from "@/typings/Volumes";
import type { Container } from "./container";
import type { Network } from "./network";
import type { Volume } from "./volume";
import { basename, dirname, join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import dotenv from "dotenv";
import { DOCKER_SOCKET_BASE_URL } from "astro:env/server";

type Config = {
  path: string;
  workingDirectory: string;
  rawContent?: string;
  content?: string;
  error?: ZodError;
  parsed?: DockerComposeConfig;
};

enum EnvFileScope {
  PROJECT = "project",
  SERVICE = "service",
}

type EnvFile = {
  path: string;
  name: string;
  content?: string;
  scope: { type: EnvFileScope.PROJECT } | { type: EnvFileScope.SERVICE; serviceNames: string[] };
};

export class Project {
  private _networks: Set<Network> = new Set();
  private _containers: Set<Container> = new Set();
  private _volumes: Set<Volume> = new Set();

  private constructor(
    public readonly name: string,
    private readonly config?: Config | undefined,
    private readonly _envFiles?: EnvFile[] | undefined
  ) {}

  get networks(): Network[] {
    return Array.from(this._networks);
  }
  get containers(): Container[] {
    return Array.from(this._containers);
  }
  get volumes(): Volume[] {
    return Array.from(this._volumes);
  }

  get envFiles(): EnvFile[] {
    return this._envFiles ?? [];
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

  get workingDirectory(): string | undefined {
    return this.config?.workingDirectory;
  }

  private static substituteEnv(input: string, env: Record<string, string | undefined>): string {
    const VAR_REGEX = /\$\{([A-Z0-9_]+)(?:(:?[-?])([^}]*))?\}/gi;
    return input.replace(VAR_REGEX, (_, name, operator, fallback) => {
      const value = env[name];

      if (value !== undefined && value !== "") {
        return value;
      }

      if (operator === ":-" || operator === "-") {
        return fallback ?? "";
      }

      if (operator === ":?" || operator === "?") {
        throw new Error(`Missing required env var ${name}: ${fallback || "no message"}`);
      }

      return "";
    });
  }

  static getEnvFiles(path: string, config: DockerComposeConfig | undefined): EnvFile[] {
    const envFiles: Map<string, EnvFile> = new Map();
    const workingDirectory = dirname(path);
    // Test if .env exists
    const envFilePath = join(workingDirectory, ".env");
    if (existsSync(envFilePath)) {
      envFiles.set(envFilePath, {
        path: envFilePath,
        name: ".env",
        content: readFileSync(envFilePath, "utf8"),
        scope: { type: EnvFileScope.PROJECT },
      });
    }

    if (config?.services) {
      for (const [key, service] of Object.entries(config.services)) {
        if (!service.env_file) continue;

        const handleEnvFile = (envFile: string | { path: string }) => {
          const serviceName = service.container_name ?? key;
          const relativePath = typeof envFile === "string" ? envFile : envFile.path;
          const path = join(workingDirectory, relativePath);

          const existingEnvFile = envFiles.get(path);
          if (existingEnvFile) {
            if (existingEnvFile.scope.type === EnvFileScope.SERVICE) {
              existingEnvFile.scope.serviceNames.push(serviceName);
            }
            return;
          }

          const name = basename(path);
          envFiles.set(path, {
            path,
            name,
            content: readFileSync(path, "utf8"),
            scope: { type: EnvFileScope.SERVICE, serviceNames: [serviceName] },
          });
        };

        if (Array.isArray(service.env_file)) {
          service.env_file.forEach(handleEnvFile);
        } else {
          handleEnvFile(service.env_file);
        }
      }
    }

    return Array.from(envFiles.values());
  }

  static async getAll(): Promise<Project[]> {
    const runningProjects = await this.getListOfRunningProjects();
    const dockerComposePaths = await this.getListOfDockerComposePaths();
    const dockerComposeConfigs = await Promise.all(
      dockerComposePaths.map(async (path) => {
        const workingDirectory = dirname(path);
        const envFilePath = join(workingDirectory, ".env");
        const envFileContent = existsSync(envFilePath) ? readFileSync(envFilePath, "utf8") : "";
        const envConfig = dotenv.parse(envFileContent);
        const content = await readFile(path, "utf8");
        const substitutedContent = this.substituteEnv(content, envConfig);
        const parsed = dockerComposeConfigSchema.safeParse(
          YAML.parse(substitutedContent, { merge: true })
        );

        const envFiles = this.getEnvFiles(path, parsed.data);

        return {
          name: this.getProjectNameFromPath(path),
          path,
          rawContent: content,
          content: substitutedContent,
          parsed: parsed.data,
          workingDirectory,
          error: parsed.error,
          envFiles,
        };
      })
    );

    const projectNames = new Set([
      ...runningProjects,
      ...dockerComposeConfigs.map(({ name }) => name),
    ]);

    return Promise.all(
      Array.from(projectNames).map(async (name) => {
        const config = dockerComposeConfigs.find((config) => config.name === name);
        return new Project(
          name,
          config
            ? {
                path: config.path,
                content: config.content,
                workingDirectory: config.workingDirectory,
                parsed: config.parsed,
                error: config.error,
              }
            : undefined,
          config?.envFiles
        );
      })
    );
  }

  private static async getListOfRunningProjects(): Promise<string[]> {
    const [containers, networks, volumes] = await Promise.all([
      new Containers().containerList({ all: true }, { baseUrl: DOCKER_SOCKET_BASE_URL }),
      new Networks().networkList({}, { baseUrl: DOCKER_SOCKET_BASE_URL }),
      new Volumes().volumeList({}, { baseUrl: DOCKER_SOCKET_BASE_URL }),
    ]);

    const ressources = [...containers.data, ...networks.data, ...(volumes.data?.Volumes ?? [])];
    return Array.from(
      new Set(
        ressources.flatMap((ressource) => ressource.Labels?.["com.docker.compose.project"] ?? [])
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
