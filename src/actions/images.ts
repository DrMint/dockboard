import { Images } from "@/typings/Images";
import { defineAction } from "astro:actions";
import { z } from "astro:content";
import { DOCKER_SOCKET_BASE_URL } from "astro:env/server";

export const images = {
  prune: defineAction({
    handler: async () => {
      const images = new Images();
      await images.imagePrune({}, { baseUrl: DOCKER_SOCKET_BASE_URL });
    },
  }),
  delete: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input) => {
      const images = new Images();
      await images.imageDelete(input.id, {}, { baseUrl: DOCKER_SOCKET_BASE_URL });
    },
  }),
};
