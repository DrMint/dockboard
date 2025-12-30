import { runCommand } from "@/utils/commands";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const projects = {
    pull: defineAction({
        accept: 'json',
        input: z.object({
            path: z.string().describe("The path to the docker-compose.yml file"),
        }),
        handler: async (input) => {
            await runCommand("docker", ["compose", "-f", input.path, "pull"]);
        },
    }),
    build: defineAction({
        accept: 'json',
        input: z.object({
            path: z.string().describe("The path to the docker-compose.yml file"),
        }),
        handler: async (input) => {
            await runCommand("docker", ["compose", "-f", input.path, "build", "--no-cache"]);
        },
    }),
    up: defineAction({
        accept: 'json',
        input: z.object({
            path: z.string().describe("The path to the docker-compose.yml file"),
        }),
        handler: async (input) => {
            await runCommand("docker", ["compose", "-f", input.path, "up", "-d"]);
        },
    }),
    down: defineAction({
        accept: 'json',
        input: z.object({
            path: z.string().describe("The path to the docker-compose.yml file"),
        }),
        handler: async (input) => {
            await runCommand("docker", ["compose", "-f", input.path, "down"]);
        },
    }),
};