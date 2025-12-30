import { Volumes } from "@/typings/Volumes";
import { defineAction } from "astro:actions";

export const volumes = {
    prune: defineAction({
        handler: async () => {
            const volumes = new Volumes();
            await volumes.volumePrune({}, { baseUrl: "http://localhost:2375" });
        },
    }),
};