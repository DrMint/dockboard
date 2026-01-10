import type { Project } from "./project";
import { Image, type ParsedImageRef } from "./image";

export class Build {

    private _image: Image | undefined = undefined;

    private constructor(
        public readonly name: string,
        public readonly imageRef: ParsedImageRef,
        public readonly project: Project,
    ) { }

    get image(): Image | undefined {
        return this._image;
    }

    setImage(image: Image) {
        this._image = image;
    }

    static async getAll(projects: Project[]): Promise<Build[]> {
        return projects.flatMap((project) => {
            return Object.entries(project.dockerCompose?.services ?? {}).flatMap(([serviceName, config]) => {
                if (config.build) {
                    const imageRef = Image.getImageRefFromCompose(project, serviceName, config);
                    return new Build(serviceName, imageRef, project);
                }
                return [];
            });
        });
    }
}