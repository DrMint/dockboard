import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { Containers } from "@/typings/Containers";
import { DOCKER_SOCKET_BASE_URL } from "astro:env/server";

export const containers = {
  start: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input) => {
      const containers = new Containers();
      await containers.containerStart(input.id, {}, { baseUrl: DOCKER_SOCKET_BASE_URL });
    },
  }),
  stop: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input) => {
      const containers = new Containers();
      await containers.containerStop(input.id, {}, { baseUrl: DOCKER_SOCKET_BASE_URL });
    },
  }),
  restart: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input) => {
      const containers = new Containers();
      await containers.containerRestart(input.id, {}, { baseUrl: DOCKER_SOCKET_BASE_URL });
    },
  }),
  kill: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input) => {
      const containers = new Containers();
      await containers.containerKill(input.id, {}, { baseUrl: DOCKER_SOCKET_BASE_URL });
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
        baseUrl: DOCKER_SOCKET_BASE_URL,
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
        baseUrl: DOCKER_SOCKET_BASE_URL,
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
      await containers.containerDelete(input.id, {}, { baseUrl: DOCKER_SOCKET_BASE_URL });
    },
  }),
  prune: defineAction({
    handler: async () => {
      const containers = new Containers();
      await containers.containerPrune({}, { baseUrl: DOCKER_SOCKET_BASE_URL });
    },
  }),
};
