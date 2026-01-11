import type { ImageInspect, ImageSummary } from "@/typings/data-contracts";
import { Images as ImagesApi } from "@/typings/Images";
import type { Container } from "./container";
import type { Project } from "./project";
import type { Build } from "./build";
import type { DockerComposeConfig } from "./docker-compose-schema";
import { cachedFetch } from "@/utils/cached-fetch";
import { DOCKER_SOCKET_BASE_URL } from "astro:env/server";

export interface ParsedImageRef {
  raw?: string;
  registry?: string;
  repository?: string;
  tag?: string;
  digest?: string;
}

export interface Opencontainers {
  /** date and time on which the image was built, conforming to RFC 3339. */
  created: string | undefined;
  /** contact details of the people or organization responsible for the image (freeform string) */
  authors: string | undefined;
  /** URL to find more information on the image (string) */
  url: string | undefined;
  /** URL to get documentation on the image (string) */
  documentation: string | undefined;
  /** URL to get source code for building the image (string) */
  source: string | undefined;
  /** version of the packaged software */
  version: string | undefined;
  /** Source control revision identifier for the packaged software. */
  revision: string | undefined;
  /** Name of the distributing entity, organization or individual. */
  vendor: string | undefined;
  /** License(s) under which contained software is distributed as an SPDX License Expression. */
  licenses: string | undefined;
  /** Name of the reference for this image. */
  refName: string | undefined;
  /** Human-readable title of the image (string) */
  title: string | undefined;
  /** Human-readable description of the software packaged in the image. */
  description: string | undefined;
}

export enum ImageUpdateStatus {
  UpToDate = "up-to-date",
  UpdateAvailable = "update-available",
  UpdateBlocked = "update-blocked",
  Unknown = "unknown",
}

interface ImageUpdateResult {
  status: ImageUpdateStatus;
  message: string;
  url?: string;
}

export class Image {
  private readonly _containers: Set<Container> = new Set();
  private _build: Build | undefined = undefined;

  private constructor(
    public readonly id: string,
    private readonly instanceImageRef?: ParsedImageRef,
    private readonly composeImageRef?: ParsedImageRef,
    public readonly isNewVersionAvailable?: ImageUpdateResult,
    public readonly instance?: ImageInspect,
    public readonly summary?: ImageSummary
  ) {}

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

  async getLatestGithubRelease(): Promise<{
    tag: string;
    url: string;
    publishedAt: string;
  } | null> {
    const source = this.opencontainers.source;
    if (!source) {
      return null;
    }
    const match = source.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return null;
    }
    const owner = match[1];
    const repo = match[2];

    const res = await cachedFetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    );

    const data = JSON.parse(res.body);

    if (data.status) {
      return null;
    }

    return {
      tag: data.tag_name,
      url: data.html_url,
      publishedAt: data.published_at,
    };
  }

  get opencontainers(): Opencontainers {
    return {
      created:
        this.instance?.Config?.Labels?.["org.opencontainers.image.created"],
      description:
        this.instance?.Config?.Labels?.["org.opencontainers.image.description"],
      documentation:
        this.instance?.Config?.Labels?.[
          "org.opencontainers.image.documentation"
        ],
      source:
        this.instance?.Config?.Labels?.["org.opencontainers.image.source"],
      title: this.instance?.Config?.Labels?.["org.opencontainers.image.title"],
      url: this.instance?.Config?.Labels?.["org.opencontainers.image.url"],
      version:
        this.instance?.Config?.Labels?.["org.opencontainers.image.version"],
      authors:
        this.instance?.Config?.Labels?.["org.opencontainers.image.authors"],
      licenses:
        this.instance?.Config?.Labels?.["org.opencontainers.image.licenses"],
      refName:
        this.instance?.Config?.Labels?.["org.opencontainers.image.ref.name"],
      revision:
        this.instance?.Config?.Labels?.["org.opencontainers.image.revision"],
      vendor:
        this.instance?.Config?.Labels?.["org.opencontainers.image.vendor"],
    };
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
      { baseUrl: DOCKER_SOCKET_BASE_URL }
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
          { baseUrl: DOCKER_SOCKET_BASE_URL }
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

        const composeImageRef = composeImageRefs.find((composeImageRef) =>
          this.isSameImageRef(composeImageRef, imageRef)
        );

        return { inspect: request.data, summary, imageRef, composeImageRef };
      })
    );

    const completeList: {
      imageRef?: ParsedImageRef;
      composeImageRef?: ParsedImageRef;
      summary?: ImageSummary;
      inspect?: ImageInspect;
    }[] = [...images];
    composeImageRefs.forEach((composeImageRef) => {
      const image = images.find((image) =>
        this.isSameImageRef(composeImageRef, image.imageRef)
      );
      if (!image) {
        completeList.push({
          composeImageRef,
        });
      }
    });

    return Promise.all(
      completeList.map(async (image) => {
        return new Image(
          image.summary?.Id ?? image.composeImageRef?.raw ?? "",
          image.imageRef,
          image.composeImageRef,
          image.imageRef
            ? await this.isNewVersionAvailable(image.imageRef, image.composeImageRef)
            : undefined,
          image?.inspect
        );
      })
    );
  }

  static isSameImageRef(ref1: ParsedImageRef, ref2: ParsedImageRef): boolean {
    if (ref1.digest && ref2.digest && ref1.digest !== undefined) {
      return ref1.digest === ref2.digest;
    }
    return (
      ref1.registry === ref2.registry &&
      ref1.repository === ref2.repository &&
      ref1.tag === ref2.tag
    );
  }

  static parseImageRef(input: string, isLocal: boolean): ParsedImageRef {
    // --- 0. Trim and replace environment variables
    let ref = input.trim();

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

  static getImageRefFromCompose(
    project: Project,
    serviceName: string,
    config: DockerComposeConfig["services"][string]
  ): ParsedImageRef {
    if (config.image) {
      const result = this.parseImageRef(
        config.image,
        config.build !== undefined
      );
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

  private static async isNewVersionAvailable(
    name: ParsedImageRef,
    composeName?: ParsedImageRef,
  ): Promise<ImageUpdateResult> {
    if (composeName?.digest) {
      return { status: ImageUpdateStatus.UpdateBlocked, message: "checks aborted, version is locked to a specific digest in the compose file." };
    }

    if (!name.registry || !name.repository || !name.tag) {
      return { status: ImageUpdateStatus.Unknown, message: "unable to check for updates, the image is probably built locally." };
    }


    if (name.registry === "docker.io") {
      // 1. get token
      const tokenRes = await cachedFetch(
        `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${name.repository}:pull`
      );
      const { token } = JSON.parse(tokenRes.body);

      // 2. fetch manifest
      const manifestRes = await cachedFetch(
        `https://registry-1.docker.io/v2/${name.repository}/manifests/${name.tag}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.docker.distribution.manifest.list.v2+json",
          },
        }
      );

      // 3. read digest
      const digest = manifestRes.headers["docker-content-digest"];
      if (!digest || !name.digest) {
        return { status: ImageUpdateStatus.Unknown, message: "unable to check for updates, docker.io returned no digest." };
      }

      const result = digest !== name.digest;
      return {
        status: result ? ImageUpdateStatus.UpdateAvailable : ImageUpdateStatus.UpToDate,
        message: result ? "update available" : "up to date",
        url: `https://hub.docker.com/layers/${name.repository}/${name.tag}`,
      };
    } else if (name.registry === "ghcr.io") {
      // 1. get token
      const tokenRes = await cachedFetch(
        `https://ghcr.io/token?scope=repository:${name.repository}:pull`
      );
      const { token } = JSON.parse(tokenRes.body);

      // 2. fetch manifest
      const manifestRes = await cachedFetch(
        `https://ghcr.io/v2/${name.repository}/manifests/${name.tag}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.oci.image.index.v1+json",
          },
        }
      );

      // 3. read digest
      const digest = manifestRes.headers["docker-content-digest"];
      if (!digest || !name.digest) {
        return { status: ImageUpdateStatus.Unknown, message: "unable to check for updates, ghcr.io returned no digest." };
      }

      const result = digest !== name.digest;
      const repo = name.repository.split("/")[1];

      return {
        status: result ? ImageUpdateStatus.UpdateAvailable : ImageUpdateStatus.UpToDate,
        message: result ? "update available" : "up to date",
        url: `https://github.com/${name.repository}/pkgs/container/${repo}`,
      };
    } else {
      return { status: ImageUpdateStatus.Unknown, message: `unable to check for updates, ${name.registry} is not a supported registry.` };
    }
  }
}
