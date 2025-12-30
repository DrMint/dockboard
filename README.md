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




Dashboard Overview

    📊 Container and image statistics at a glance
    💾 Total image size monitoring
    🔄 Real-time container status updates
    📈 Resource usage visualization

Container Management

    📋 Detailed container list with status indicators
    🔍 Container inspection with detailed information
        Port mappings
        Network settings
        Mount points
        Container labels
    📊 Resource monitoring
        CPU usage and distribution
        Memory usage
        Network statistics
        Block I/O statistics
    💻 Integrated terminal access
    📝 Process list viewing
    📜 Log viewer with real-time updates
    📂 Container File Browser
        File tree navigation with dynamic loading
        Folder upload and download support
        Single file upload and download with mode preservation
        Symlink support and pagination for large directories
        Context menus for file/folder operations

Docker Events

    🔔 Real-time Docker event listening
    🔍 Comprehensive event filtering and search
    📋 JSON details dialog for inspecting event data
    ⚡ Action buttons with Copy JSON and Remove options

Image Management

    📦 Image list with size and tag information
    🏗️ Image Build
        Build from Dockerfile
        Support for build args and tags
        Real-time build log streaming
        Historical log playback
    🕒 Creation time tracking
    🔍 Detailed image inspection
    📊 Usage statistics
        Total count
        Size analytics
        Usage tracking

System Integration

    🔌 Native Docker daemon connection
    🚀 Lightweight and fast performance
    💻 Cross-platform desktop application
