import type { DockerComposeConfig } from "./docker-compose-schema";
import type { Volume as VolumeSummary } from "@/typings/data-contracts";

export class Volume {
  constructor(
    public readonly name: string,
    public readonly config?: NonNullable<
      DockerComposeConfig["volumes"]
    >[string],
    public readonly instance?: VolumeSummary
  ) {}
}
