import { Volumes } from "@/typings/Volumes";
import { defineAction } from "astro:actions";
import { DOCKER_SOCKET_BASE_URL } from "astro:env/server";

export const volumes = {
  prune: defineAction({
    handler: async () => {
      const volumes = new Volumes();
      await volumes.volumePrune({}, { baseUrl: DOCKER_SOCKET_BASE_URL });
    },
  }),
};
