import { Networks } from "@/typings/Networks";
import { defineAction } from "astro:actions";

export const networks = {
  prune: defineAction({
    handler: async () => {
      const networks = new Networks();
      await networks.networkPrune({}, { baseUrl: "http://localhost:2375" });
    },
  }),
};
