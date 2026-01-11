# Dockboard

What I'm looking for in a Docker management tool/orchestrator:

- List containers, images, networks, volumes
- View utilization stats: CPU, memory, storage, network
- View logs, enter terminal inside the container when possible
- Create, view, edit projects (docker compose)
- Perform simple operations like build, start, pause, stop, restart, on containers and projects
- List and get notified of image updates
- (Nice to have) Support for multiple hosts

## Limitations

- Doesn't support custom compose project name
  - name at the root of the docker-compose.yml
  - COMPOSE_PROJECT_NAME in the .env
