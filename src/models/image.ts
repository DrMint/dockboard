import type { ImageInspect, ImageSummary } from "@/typings/data-contracts";
import { Images as ImagesApi } from "@/typings/Images";
import type { Container } from "./container";
import type { Project } from "./project";
import type { Build } from "./build";
import type { DockerComposeConfig } from "./docker-compose-schema";

export interface ParsedImageRef {
  raw?: string;
  registry?: string;
  repository?: string;
  tag?: string;
  digest?: string;
}

export class Image {
  private readonly _containers: Set<Container> = new Set();
  private _build: Build | undefined = undefined;

  private constructor(
    public readonly id: string,
    private readonly instanceImageRef?: ParsedImageRef,
    private readonly composeImageRef?: ParsedImageRef,
    public readonly instance?: ImageInspect,
    public readonly summary?: ImageSummary
  ) { }

  get name(): ParsedImageRef {
    if (this.composeImageRef && this.instanceImageRef?.tag === "latest") {
      return { ...this.instanceImageRef, tag: this.composeImageRef.tag };
    }
    return this.instanceImageRef ?? this.composeImageRef ?? {};
  }

  get normalizedName(): string {
    let result = "";
    if (this.name.registry && this.name.registry !== "docker.io") {
      result += `${this.name.registry}/`;
    }
    if (this.name.repository) {
      result += this.name.repository.replace("library/", "");
    }
    if (this.name.tag && this.name.tag !== "latest") {
      result += `:${this.name.tag}`;
    }
    if (result === "") {
      result = "<untagged>";
    }
    return result;
  }

  get shortName(): string {
    let result = "";
    if (this.name.repository) {
      result += this.name.repository.replace("library/", "");
    }
    return result;
  }

  get build(): Build | undefined {
    return this._build;
  }


  setBuild(build: Build) {
    this._build = build;
  }

  get containers(): Container[] {
    return Array.from(this._containers);
  }

  addContainer(container: Container): void {
    this._containers.add(container);
  }

  get isPulled(): boolean {
    return this.instance !== undefined;
  }

  get exposedPorts(): string[] {
    return Object.keys(this.instance?.Config?.ExposedPorts ?? {});
  }

  get size(): number {
    return this.instance?.Size ?? 0;
  }

  get createdAt(): Date | undefined {
    return this.instance?.Created ? new Date(this.instance.Created) : undefined;
  }

  static async getAll(projects: Project[]): Promise<Image[]> {
    const imagesApi = new ImagesApi();
    const { data: imageSummaries } = await imagesApi.imageList(
      { all: true },
      { baseUrl: "http://localhost:2375" }
    );

    const composeImageRefs = projects.flatMap((project) => {
      return Object.entries(project.dockerCompose?.services ?? {}).flatMap(
        ([serviceName, config]) => {
          return this.getImageRefFromCompose(project, serviceName, config);
        }
      );
    });

    const images = await Promise.all(
      imageSummaries.map(async (summary) => {
        const request = await imagesApi.imageInspect(
          summary.Id,
          {},
          { baseUrl: "http://localhost:2375" }
        );

        let imageRef: ParsedImageRef = {};

        const repoTag = request.data.RepoTags?.[0];
        const repoDigest = request.data.RepoDigests?.[0];

        if (repoDigest) {
          imageRef = this.parseImageRef(repoDigest, false);
          if (repoTag) {
            imageRef.tag = this.parseImageRef(repoTag, false).tag;
          }
        } else if (repoTag) {
          imageRef = this.parseImageRef(repoTag, true);
        }

        const composeImageRef = composeImageRefs.find((composeImageRef) => this.isSameImageRef(composeImageRef, imageRef));

        return { inspect: request.data, summary, imageRef, composeImageRef };
      })
    );

    const completeList: { imageRef?: ParsedImageRef, composeImageRef?: ParsedImageRef, summary?: ImageSummary, inspect?: ImageInspect }[] = [...images];
    composeImageRefs.forEach((composeImageRef) => {
      const image = images.find((image) => this.isSameImageRef(composeImageRef, image.imageRef));
      if (!image) {
        completeList.push({
          composeImageRef,
        });
      }
    });

    return completeList.map((image) => {
      return new Image(image.summary?.Id ?? image.composeImageRef?.raw ?? "", image.imageRef, image.composeImageRef, image?.inspect);
    });
  }

  static isSameImageRef(ref1: ParsedImageRef, ref2: ParsedImageRef): boolean {
    if (ref1.digest && ref2.digest && ref1.digest !== undefined) {
      return ref1.digest === ref2.digest;
    }
    return ref1.registry === ref2.registry && ref1.repository === ref2.repository && ref1.tag === ref2.tag;
  }

  static parseImageRef(input: string, isLocal: boolean): ParsedImageRef {
    // --- 0. Trim and replace environment variables
    let ref = input.trim();
    ref = ref.replaceAll(
      /\$\{[^}:]+:-([^}]+)\}/g,
      "$1"
    );

    // --- 1. Split digest (if any)
    let digest: string | undefined;
    const digestIndex = ref.indexOf("@");
    if (digestIndex !== -1) {
      digest = ref.slice(digestIndex + 1);
      ref = ref.slice(0, digestIndex);
    }

    // --- 2. Split tag (only after last slash)
    let tag = "latest";
    const lastColon = ref.lastIndexOf(":");
    const lastSlash = ref.lastIndexOf("/");

    if (lastColon > lastSlash) {
      tag = ref.slice(lastColon + 1);
      ref = ref.slice(0, lastColon);
    }

    // --- 3. Split registry vs repository
    let registry = isLocal ? undefined : "docker.io";
    let repository = ref;

    const firstSlash = ref.indexOf("/");

    if (firstSlash !== -1) {
      const firstPart = ref.slice(0, firstSlash);
      if (
        firstPart.includes(".") ||
        firstPart.includes(":") ||
        firstPart === "localhost"
      ) {
        registry = firstPart;
        repository = ref.slice(firstSlash + 1);
      }
    }

    // --- 4. Docker Hub implicit library namespace
    if (registry === "docker.io" && !repository.includes("/")) {
      repository = `library/${repository}`;
    }

    return {
      raw: input,
      registry,
      repository,
      tag,
      digest,
    };
  }

  static getImageRefFromCompose(project: Project, serviceName: string, config: DockerComposeConfig["services"][string]): ParsedImageRef {
    if (config.image) {
      const result = this.parseImageRef(config.image, config.build !== undefined);
      if (config.build) {
        result.registry = undefined;
      }
      return result;
    }
    if (config.build) {
      const result: ParsedImageRef = {
        repository: `${project.name}-${serviceName}`,
        tag: "latest",
      };
      return result;
    }
    return {};
  }
}
