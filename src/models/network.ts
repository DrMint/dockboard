import type { NetworkSummary } from "@/typings/data-contracts";
import type { DockerComposeConfig } from "./docker-compose-schema";
import type { Project, RunningResources } from "./project";

export class Network {
  constructor(
    public readonly name: string,
    private readonly project: Project,
    private readonly runningResources: RunningResources,
    public readonly config?: NonNullable<
      DockerComposeConfig["networks"]
    >[string],
    public readonly instance?: NetworkSummary
  ) {}

  get containers(): string[] {
    const containersFromConfig = this.containersFromConfig;
    const runningContainers =
      this.runningResources.containers.filter(
        (container) => container.NetworkSettings?.Networks?.[this.name]
      ).map((container) => container.Names![0].slice(1));

    const uniqueContainers = new Set([
      ...containersFromConfig,
      ...runningContainers,
    ]);

    return Array.from(uniqueContainers);
  }

  private get containersFromConfig(): string[] {
    const containers = this.project.config?.services;
    if (!containers) return [];
    return Object.keys(containers).filter((container) => {
      const networks = containers[container].networks;
      if (!networks) return `${this.project.name}_default` === this.name;
      if (Array.isArray(networks)) return networks.includes(this.name);
      return networks[this.name];
    });
  }

  // Override json to prevent circular references
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      containers: this.containers,
    };
  }
}
