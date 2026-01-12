import { Plugins } from "@/typings/Plugins";
import type { Plugin as PluginData } from "@/typings/data-contracts";
import { DOCKER_SOCKET_BASE_URL } from "astro:env/server";

export class Plugin {
  private constructor(
    public readonly name: string,
    private readonly data: PluginData
  ) {}

  get enabled(): boolean {
    return this.data.Enabled;
  }

  static async getAll(): Promise<Plugin[]> {
    const plugins = new Plugins();
    const { data: pluginsData } = await plugins.pluginList(
      {},
      {
        baseUrl: DOCKER_SOCKET_BASE_URL,
      }
    );
    return pluginsData.map((plugin) => new Plugin(plugin.Name, plugin));
  }
}
