import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { Containers } from "@/typings/Containers";

export const containers = {
  start: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input) => {
      const containers = new Containers();
      await containers.containerStart(
        input.id,
        {},
        { baseUrl: "http://localhost:2375" }
      );
    },
  }),
  stop: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input) => {
      const containers = new Containers();
      await containers.containerStop(
        input.id,
        {},
        { baseUrl: "http://localhost:2375" }
      );
    },
  }),
  restart: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input) => {
      const containers = new Containers();
      await containers.containerRestart(
        input.id,
        {},
        { baseUrl: "http://localhost:2375" }
      );
    },
  }),
  kill: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input) => {
      const containers = new Containers();
      await containers.containerKill(
        input.id,
        {},
        { baseUrl: "http://localhost:2375" }
      );
    },
  }),
  pause: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input) => {
      const containers = new Containers();
      await containers.containerPause(input.id, {
        baseUrl: "http://localhost:2375",
      });
    },
  }),
  unpause: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input) => {
      const containers = new Containers();
      await containers.containerUnpause(input.id, {
        baseUrl: "http://localhost:2375",
      });
    },
  }),
  delete: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input) => {
      const containers = new Containers();
      await containers.containerDelete(
        input.id,
        {},
        { baseUrl: "http://localhost:2375" }
      );
    },
  }),
  prune: defineAction({
    handler: async () => {
      const containers = new Containers();
      await containers.containerPrune({}, { baseUrl: "http://localhost:2375" });
    },
  }),
};
