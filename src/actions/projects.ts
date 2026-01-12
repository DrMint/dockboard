import { runCommand } from "@/utils/commands";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const projects = {
  pull: defineAction({
    accept: "json",
    input: z.object({
      path: z.string().describe("The path to the docker-compose.yml file"),
    }),
    handler: async (input) => {
      await runCommand("docker", ["compose", "-f", input.path, "pull"]);
    },
  }),
  build: defineAction({
    accept: "json",
    input: z.object({
      path: z.string().describe("The path to the docker-compose.yml file"),
    }),
    handler: async (input) => {
      await runCommand("docker", ["compose", "-f", input.path, "build", "--no-cache"]);
    },
  }),
  up: defineAction({
    accept: "json",
    input: z.object({
      path: z.string().describe("The path to the docker-compose.yml file"),
      service: z.string().describe("The service to start").optional(),
    }),
    handler: async (input) => {
      const command = ["compose", "-f", input.path, "up", "-d"];
      if (input.service) {
        command.push(input.service);
      }
      await runCommand("docker", command);
    },
  }),
  down: defineAction({
    accept: "json",
    input: z.object({
      path: z.string().describe("The path to the docker-compose.yml file"),
    }),
    handler: async (input) => {
      await runCommand("docker", ["compose", "-f", input.path, "down"]);
    },
  }),
};
