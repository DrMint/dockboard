import type { Project } from "./project";
import { Image, type ParsedImageRef } from "./image";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

type BuildConfig = {
  workingDirectory: string;
  path: string;
  content: string;
};

export class Build {
  private _image: Image | undefined = undefined;

  private constructor(
    public readonly name: string,
    public readonly imageRef: ParsedImageRef,
    public readonly project: Project,
    public readonly config?: BuildConfig | undefined
  ) {}

  get image(): Image | undefined {
    return this._image;
  }

  get dockerfilePath(): string | undefined {
    return this.config?.path;
  }

  get dockerfileContent(): string | undefined {
    return this.config?.content;
  }

  setImage(image: Image) {
    this._image = image;
  }

  static async getAll(projects: Project[]): Promise<Build[]> {
    const builds = projects.flatMap((project) => {
      return Object.entries(project.dockerCompose?.services ?? {}).flatMap(
        ([serviceName, config]) => {
          if (config.build) {
            const imageRef = Image.getImageRefFromCompose(project, serviceName, config);

            if (config.build && project.workingDirectory) {
              const contextPath =
                typeof config.build === "string" ? config.build : config.build.context;
              const workingDirectory = join(project.workingDirectory, contextPath);
              const dockerfileName =
                (typeof config.build === "object" ? config.build.dockerfile : undefined) ??
                "Dockerfile";
              return {
                serviceName,
                imageRef,
                project,
                config: {
                  workingDirectory,
                  path: join(workingDirectory, dockerfileName),
                },
              };
            }
            return { serviceName, imageRef, project, config: undefined };
          }
          return [];
        }
      );
    });

    return await Promise.all(
      builds.map(async (build) => {
        if (build.config?.path) {
          const content = await readFile(build.config.path, "utf8");
          const config = {
            workingDirectory: build.config.workingDirectory,
            path: build.config.path,
            content,
          };
          return new Build(build.serviceName, build.imageRef, build.project, config);
        }
        return new Build(build.serviceName, build.imageRef, build.project);
      })
    );
  }
}
