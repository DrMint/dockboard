import type { ContainerSummary } from "@/typings/data-contracts";
import type { DockerComposeConfig } from "./docker-compose-schema";

export class Container {
  constructor(
    public readonly name: string,
    private readonly project?: { name: string; config: DockerComposeConfig | null },
    private readonly config?: DockerComposeConfig["services"][string],
    private readonly instance?: ContainerSummary
  ) { }

  get networks(): string[] {
    const networksFromConfig = this.networksFromConfig;
    const networksFromInstance = Object.keys(
      this.instance?.NetworkSettings?.Networks ?? {}
    );
    const uniqueNetworks = new Set([
      ...networksFromConfig,
      ...networksFromInstance,
    ]);
    return Array.from(uniqueNetworks);
  }

  get dependsOn(): string[] {
    const dependsOn = this.config?.depends_on;
    if (!dependsOn) return [];
    if (Array.isArray(dependsOn)) return dependsOn;
    return Object.keys(dependsOn);
  }

  get ports(): string[] {
    const ports = this.config?.ports;
    if (!ports) return [];
    return ports.map((port) =>
      typeof port === "string" ? port.split(":")[0] : `${port.published}`
    );
  }

  get mounts(): string[] {
    const mounts = this.config?.volumes;
    if (!mounts) return [];
    return mounts.map((mount) => mount.split(":")[0]);
  }

  get isInstanciated(): boolean {
    return this.instance !== undefined;
  }

  get isRunning(): boolean {
    return this.instance?.State === "running";
  }

  get state(): NonNullable<ContainerSummary["State"]> | "down" {
    return this.instance?.State ?? "down";
  }

  private get networksFromConfig(): string[] {
    const networks = this.config?.networks;
    const defaultNetwork = `${this.project?.name}_default`;
    if (!networks) return [defaultNetwork];
    if (Array.isArray(networks)) return networks;
    return Object.keys(networks).map(
      (network) => networks[network]?.interface_name ?? network
    );
  }

  // Override json to prevent circular references
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      networks: this.networks,
      dependsOn: this.dependsOn,
      ports: this.ports,
      mounts: this.mounts,
    };
  }
}
