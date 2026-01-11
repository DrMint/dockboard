import { defineMiddleware } from "astro:middleware";
import { Host } from "@/models/host";
import { DOCKER_SOCKET_BASE_URL } from "astro:env/server";

export const onRequest = defineMiddleware(async (context, next) => {
    const host = await Host.fromDockerSocket(DOCKER_SOCKET_BASE_URL);
    context.locals.host = host;
    return next();
});
