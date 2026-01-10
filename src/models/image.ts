import type { ImageInspect, ImageSummary } from "@/typings/data-contracts";
import { Images as ImagesApi } from "@/typings/Images";
import type { Container } from "./container";
import type { Project } from "./project";

export class Image {
  private readonly _containers: Set<Container> = new Set();
  private _build: Build | undefined = undefined;

  private constructor(
    public readonly name: string,
    public readonly id: string,
    public readonly instance?: ImageInspect,
    public readonly summary?: ImageSummary
  ) { }

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

  get tags(): string[] {
    return (this.instance?.RepoTags ?? []).map((tag) => tag.split(":")[1]);
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
      {},
      { baseUrl: "http://localhost:2375" }
    );

    const images = await Promise.all(
      imageSummaries.map(async (summary) => {
        const request = await imagesApi.imageInspect(
          summary.Id,
          {},
          { baseUrl: "http://localhost:2375" }
        );
        return { inspect: request.data, summary };
      })
    );

    const composeImageNames = projects.flatMap((project) => {
      return Object.entries(project.dockerCompose?.services ?? {}).flatMap(
        ([serviceName, config]) => {
          if (config.image) {
            return [this.normalizeComposeImage(config.image)]
          }
          if (config.build) {
            return [`${project.name}-${serviceName}:latest`];
          }
          return [];
        }
      );
    });

    const composeImagesNotInstanciated = composeImageNames.filter(
      (name) =>
        images.find(
          (image) =>
            (image.summary.RepoTags?.[0] ?? image.summary.RepoDigests?.[0]) ===
            name
        ) === undefined
    );

    console.log(composeImagesNotInstanciated);

    const uniqueImages = new Set([
      ...images.map((image) => image.summary.Id),
      ...composeImagesNotInstanciated,
    ]);

    return Array.from(uniqueImages).map((id) => {
      const inspect = images.find((image) => image.summary.Id === id)?.inspect;

      const name = inspect?.RepoTags?.[0] ?? inspect?.RepoDigests?.[0] ?? id;

      return new Image(this.formatImageName(name), id, inspect);
    });
  }

  static formatImageName(name: string): string {
    // Drop digest if present
    name = name.replace(/@sha256:[a-f0-9]{64}/, "");
    return name;
  }

  static normalizeComposeImage(image: string): string {
    // Drop default registry
    image = image.replace(/^docker\.io\//, "");
    image = image.replace(/^library\//, "");

    // Check if the image reference contains a digest
    const digest = image.match(/@sha256:[a-f0-9]{64}/);

    // If true, remove the tag if present (the tag is the part after : and before @)
    if (digest) {
      return image.replace(/:[^:@]+@/, "@");
    } else {
      // If no digest and notag is present, add the default tag
      if (!image.includes(":")) {
        image = `${image}:latest`;
      }
      return image;
    }
  }
}
