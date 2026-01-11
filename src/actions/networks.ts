import { Networks } from "@/typings/Networks";
import { defineAction } from "astro:actions";
import { DOCKER_SOCKET_BASE_URL } from "astro:env/server";

export const networks = {
  prune: defineAction({
    handler: async () => {
      const networks = new Networks();
      await networks.networkPrune({}, { baseUrl: DOCKER_SOCKET_BASE_URL });
    },
  }),
};
