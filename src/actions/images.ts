import { Images } from "@/typings/Images";
import { defineAction } from "astro:actions";
import { z } from "astro:content";

export const images = {
  prune: defineAction({
    handler: async () => {
      const images = new Images();
      await images.imagePrune({}, { baseUrl: "http://localhost:2375" });
    },
  }),
  delete: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input) => {
      const images = new Images();
      await images.imageDelete(
        input.id,
        {},
        { baseUrl: "http://localhost:2375" }
      );
    },
  }),
};
