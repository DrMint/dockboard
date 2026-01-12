import { Info } from "@/typings/Info";
import { Project } from "./project";
import { Container } from "./container";
import { Network } from "./network";
import { Volume } from "./volume";
import { Image } from "./image";
import { Build } from "./build";
import { Plugin } from "./plugin";

export class Host {
  private constructor(
    public readonly name: string,
    public readonly projects: Project[],
    public readonly containers: Container[],
    public readonly networks: Network[],
    public readonly volumes: Volume[],
    public readonly images: Image[],
    public readonly builds: Build[],
    public readonly plugins: Plugin[]
  ) {}

  static async fromDockerSocket(url: string): Promise<Host> {
    const info = new Info();
    const { data: systemInfo } = await info.systemInfo({
      baseUrl: url,
    });
    const projects = await Project.getAll();
    const containers = await Container.getAll(projects);
    const networks = await Network.getAll(projects);
    const volumes = await Volume.getAll(projects);
    const images = await Image.getAll(projects);
    const builds = await Build.getAll(projects);
    const plugins = await Plugin.getAll();

    // Link containers --> projects
    containers.forEach((container) => {
      container.project?.addContainer(container);
    });

    // Link networks --> projects
    networks.forEach((network) => {
      network.project?.addNetwork(network);
    });

    // Link volumes --> projects
    volumes.forEach((volume) => {
      volume.project?.addVolume(volume);
    });

    // Link builds <--> images
    builds.forEach((build) => {
      const image = images.find((image) => Image.isSameImageRef(build.imageRef, image.name));
      if (image) {
        build.setImage(image);
        image.setBuild(build);
      }
    });

    // Link images <--> containers
    containers.forEach((container) => {
      const image =
        images.find((image) => image.id === container.imageId) ??
        images.find(
          (image) => container.imageRef && Image.isSameImageRef(container.imageRef, image.name)
        );

      if (image) {
        container.setImage(image);
        image.addContainer(container);
        return;
      }
    });

    // Link containers <--> networks
    containers.forEach((container) => {
      container.networkNames.forEach((networkName) => {
        const network = networks.find((network) => network.name === networkName);
        if (network) {
          network.addContainer(container);
          container.addNetwork(network);
        } else {
          console.error(`Network ${networkName} not found for container ${container.name}`);
        }
      });
    });

    // TODO: Link volumes <--> containers

    return new Host(
      systemInfo!.Name!,
      projects,
      containers,
      networks,
      volumes,
      images,
      builds,
      plugins
    );
  }
}
