import { Plugins } from "@/typings/Plugins";
import { defineAction } from "astro:actions";
import { DOCKER_SOCKET_BASE_URL } from "astro:env/server";
import { z } from "astro:content";

export const plugins = {
  enable: defineAction({
    input: z.object({
      name: z.string(),
    }),
    handler: async (input) => {
      const plugins = new Plugins();
      await plugins.pluginEnable(input.name, {}, { baseUrl: DOCKER_SOCKET_BASE_URL });
    },
  }),
  disable: defineAction({
    input: z.object({
      name: z.string(),
    }),
    handler: async (input) => {
      const plugins = new Plugins();
      await plugins.pluginDisable(input.name, {}, { baseUrl: DOCKER_SOCKET_BASE_URL });
    },
  }),
};
