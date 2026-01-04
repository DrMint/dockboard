import type {
  ContainerConfig,
  ContainerCreateResponse,
  ContainerInspectResponse,
  ContainerStatsResponse,
  ContainerSummary,
  ContainerTopResponse,
  ContainerUpdateResponse,
  ContainerWaitResponse,
  ErrorResponse,
  FilesystemChange,
  HostConfig,
  IDResponse,
  NetworkingConfig,
  Resources,
  RestartPolicy,
} from "./data-contracts";
import { ContentType, HttpClient, type RequestParams } from "./http-client";

export class Containers<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Returns a list of containers. For details on the format, see the [inspect endpoint](#operation/ContainerInspect). Note that it uses a different, smaller representation of a container than inspecting a single container. For example, the list of linked containers is not propagated .
   *
   * @tags Container
   * @name ContainerList
   * @summary List containers
   * @request GET:/containers/json
   */
  containerList = (
    query?: {
      /**
       * Return all containers. By default, only running containers are shown.
       * @default false
       */
      all?: boolean;
      /**
       * Return this number of most recently created containers, including
       * non-running ones.
       */
      limit?: number;
      /**
       * Return the size of container as fields `SizeRw` and `SizeRootFs`.
       * @default false
       */
      size?: boolean;
      /**
       * Filters to process on the container list, encoded as JSON (a
       * `map[string][]string`). For example, `{"status": ["paused"]}` will
       * only return paused containers.
       *
       * Available filters:
       *
       * - `ancestor`=(`<image-name>[:<tag>]`, `<image id>`, or `<image@digest>`)
       * - `before`=(`<container id>` or `<container name>`)
       * - `expose`=(`<port>[/<proto>]`|`<startport-endport>/[<proto>]`)
       * - `exited=<int>` containers with exit code of `<int>`
       * - `health`=(`starting`|`healthy`|`unhealthy`|`none`)
       * - `id=<ID>` a container's ID
       * - `isolation=`(`default`|`process`|`hyperv`) (Windows daemon only)
       * - `is-task=`(`true`|`false`)
       * - `label=key` or `label="key=value"` of a container label
       * - `name=<name>` a container's name
       * - `network`=(`<network id>` or `<network name>`)
       * - `publish`=(`<port>[/<proto>]`|`<startport-endport>/[<proto>]`)
       * - `since`=(`<container id>` or `<container name>`)
       * - `status=`(`created`|`restarting`|`running`|`removing`|`paused`|`exited`|`dead`)
       * - `volume`=(`<volume name>` or `<mount point destination>`)
       */
      filters?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<ContainerSummary[], ErrorResponse>({
      path: `/containers/json`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Container
   * @name ContainerCreate
   * @summary Create a container
   * @request POST:/containers/create
   */
  containerCreate = (
    body: ContainerConfig & {
      /** Container configuration that depends on the host we are running on */
      HostConfig?: HostConfig;
      /**
       * NetworkingConfig represents the container's networking configuration for
       * each of its interfaces.
       * It is used for the networking configs specified in the `docker create`
       * and `docker network connect` commands.
       */
      NetworkingConfig?: NetworkingConfig;
    },
    query?: {
      /**
       * Assign the specified name to the container. Must match
       * `/?[a-zA-Z0-9][a-zA-Z0-9_.-]+`.
       * @pattern ^/?[a-zA-Z0-9][a-zA-Z0-9_.-]+$
       */
      name?: string;
      /**
       * Platform in the format `os[/arch[/variant]]` used for image lookup.
       *
       * When specified, the daemon checks if the requested image is present
       * in the local image cache with the given OS and Architecture, and
       * otherwise returns a `404` status.
       *
       * If the option is not set, the host's native OS and Architecture are
       * used to look up the image in the image cache. However, if no platform
       * is passed and the given image does exist in the local image cache,
       * but its OS or architecture does not match, the container is created
       * with the available image, and a warning is added to the `Warnings`
       * field in the response, for example;
       *
       *     WARNING: The requested image's platform (linux/arm64/v8) does not
       *              match the detected host platform (linux/amd64) and no
       *              specific platform was requested
       * @default ""
       */
      platform?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<ContainerCreateResponse, ErrorResponse>({
      path: `/containers/create`,
      method: "POST",
      query: query,
      body: body,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Return low-level information about a container.
   *
   * @tags Container
   * @name ContainerInspect
   * @summary Inspect a container
   * @request GET:/containers/{id}/json
   */
  containerInspect = (
    id: string,
    query?: {
      /**
       * Return the size of container as fields `SizeRw` and `SizeRootFs`
       * @default false
       */
      size?: boolean;
    },
    params: RequestParams = {}
  ) =>
    this.request<ContainerInspectResponse, ErrorResponse>({
      path: `/containers/${id}/json`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description On Unix systems, this is done by running the `ps` command. This endpoint is not supported on Windows.
   *
   * @tags Container
   * @name ContainerTop
   * @summary List processes running inside a container
   * @request GET:/containers/{id}/top
   */
  containerTop = (
    id: string,
    query?: {
      /**
       * The arguments to pass to `ps`. For example, `aux`
       * @default "-ef"
       */
      ps_args?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<ContainerTopResponse, ErrorResponse>({
      path: `/containers/${id}/top`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Get `stdout` and `stderr` logs from a container. Note: This endpoint works only for containers with the `json-file` or `journald` logging driver.
   *
   * @tags Container
   * @name ContainerLogs
   * @summary Get container logs
   * @request GET:/containers/{id}/logs
   */
  containerLogs = (
    id: string,
    query?: {
      /**
       * Keep connection after returning logs.
       * @default false
       */
      follow?: boolean;
      /**
       * Return logs from `stdout`
       * @default false
       */
      stdout?: boolean;
      /**
       * Return logs from `stderr`
       * @default false
       */
      stderr?: boolean;
      /**
       * Only return logs since this time, as a UNIX timestamp
       * @default 0
       */
      since?: number;
      /**
       * Only return logs before this time, as a UNIX timestamp
       * @default 0
       */
      until?: number;
      /**
       * Add timestamps to every log line
       * @default false
       */
      timestamps?: boolean;
      /**
       * Only return this number of log lines from the end of the logs.
       * Specify as an integer or `all` to output all log lines.
       * @default "all"
       */
      tail?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<File, ErrorResponse>({
      path: `/containers/${id}/logs`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * @description Returns which files in a container's filesystem have been added, deleted, or modified. The `Kind` of modification can be one of: - `0`: Modified ("C") - `1`: Added ("A") - `2`: Deleted ("D")
   *
   * @tags Container
   * @name ContainerChanges
   * @summary Get changes on a container’s filesystem
   * @request GET:/containers/{id}/changes
   */
  containerChanges = (id: string, params: RequestParams = {}) =>
    this.request<FilesystemChange[], ErrorResponse>({
      path: `/containers/${id}/changes`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Export the contents of a container as a tarball.
   *
   * @tags Container
   * @name ContainerExport
   * @summary Export a container
   * @request GET:/containers/{id}/export
   */
  containerExport = (id: string, params: RequestParams = {}) =>
    this.request<void, ErrorResponse>({
      path: `/containers/${id}/export`,
      method: "GET",
      ...params,
    });
  /**
   * @description This endpoint returns a live stream of a container’s resource usage statistics. The `precpu_stats` is the CPU statistic of the *previous* read, and is used to calculate the CPU usage percentage. It is not an exact copy of the `cpu_stats` field. If either `precpu_stats.online_cpus` or `cpu_stats.online_cpus` is nil then for compatibility with older daemons the length of the corresponding `cpu_usage.percpu_usage` array should be used. On a cgroup v2 host, the following fields are not set * `blkio_stats`: all fields other than `io_service_bytes_recursive` * `cpu_stats`: `cpu_usage.percpu_usage` * `memory_stats`: `max_usage` and `failcnt` Also, `memory_stats.stats` fields are incompatible with cgroup v1. To calculate the values shown by the `stats` command of the docker cli tool the following formulas can be used: * used_memory = `memory_stats.usage - memory_stats.stats.cache` * available_memory = `memory_stats.limit` * Memory usage % = `(used_memory / available_memory) * 100.0` * cpu_delta = `cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage` * system_cpu_delta = `cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage` * number_cpus = `length(cpu_stats.cpu_usage.percpu_usage)` or `cpu_stats.online_cpus` * CPU usage % = `(cpu_delta / system_cpu_delta) * number_cpus * 100.0`
   *
   * @tags Container
   * @name ContainerStats
   * @summary Get container stats based on resource usage
   * @request GET:/containers/{id}/stats
   */
  containerStats = (
    id: string,
    query?: {
      /**
       * Stream the output. If false, the stats will be output once and then
       * it will disconnect.
       * @default true
       */
      stream?: boolean;
      /**
       * Only get a single stat instead of waiting for 2 cycles. Must be used
       * with `stream=false`.
       * @default false
       */
      "one-shot"?: boolean;
    },
    params: RequestParams = {}
  ) =>
    this.request<ContainerStatsResponse, ErrorResponse>({
      path: `/containers/${id}/stats`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Resize the TTY for a container.
   *
   * @tags Container
   * @name ContainerResize
   * @summary Resize a container TTY
   * @request POST:/containers/{id}/resize
   */
  containerResize = (
    id: string,
    query: {
      /** Height of the TTY session in characters */
      h: number;
      /** Width of the TTY session in characters */
      w: number;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/containers/${id}/resize`,
      method: "POST",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags Container
   * @name ContainerStart
   * @summary Start a container
   * @request POST:/containers/{id}/start
   */
  containerStart = (
    id: string,
    query?: {
      /**
       * Override the key sequence for detaching a container. Format is a
       * single character `[a-Z]` or `ctrl-<value>` where `<value>` is one
       * of: `a-z`, `@`, `^`, `[`, `,` or `_`.
       */
      detachKeys?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, void | ErrorResponse>({
      path: `/containers/${id}/start`,
      method: "POST",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags Container
   * @name ContainerStop
   * @summary Stop a container
   * @request POST:/containers/{id}/stop
   */
  containerStop = (
    id: string,
    query?: {
      /** Signal to send to the container as an integer or string (e.g. `SIGINT`). */
      signal?: string;
      /** Number of seconds to wait before killing the container */
      t?: number;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, void | ErrorResponse>({
      path: `/containers/${id}/stop`,
      method: "POST",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags Container
   * @name ContainerRestart
   * @summary Restart a container
   * @request POST:/containers/{id}/restart
   */
  containerRestart = (
    id: string,
    query?: {
      /** Signal to send to the container as an integer or string (e.g. `SIGINT`). */
      signal?: string;
      /** Number of seconds to wait before killing the container */
      t?: number;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/containers/${id}/restart`,
      method: "POST",
      query: query,
      ...params,
    });
  /**
   * @description Send a POSIX signal to a container, defaulting to killing to the container.
   *
   * @tags Container
   * @name ContainerKill
   * @summary Kill a container
   * @request POST:/containers/{id}/kill
   */
  containerKill = (
    id: string,
    query?: {
      /**
       * Signal to send to the container as an integer or string (e.g. `SIGINT`).
       * @default "SIGKILL"
       */
      signal?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/containers/${id}/kill`,
      method: "POST",
      query: query,
      ...params,
    });
  /**
   * @description Change various configuration options of a container without having to recreate it.
   *
   * @tags Container
   * @name ContainerUpdate
   * @summary Update a container
   * @request POST:/containers/{id}/update
   */
  containerUpdate = (
    id: string,
    update: Resources & {
      /**
       * The behavior to apply when the container exits. The default is not to
       * restart.
       *
       * An ever increasing delay (double the previous delay, starting at 100ms) is
       * added before each restart to prevent flooding the server.
       */
      RestartPolicy?: RestartPolicy;
    },
    params: RequestParams = {}
  ) =>
    this.request<ContainerUpdateResponse, ErrorResponse>({
      path: `/containers/${id}/update`,
      method: "POST",
      body: update,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Container
   * @name ContainerRename
   * @summary Rename a container
   * @request POST:/containers/{id}/rename
   */
  containerRename = (
    id: string,
    query: {
      /** New name for the container */
      name: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/containers/${id}/rename`,
      method: "POST",
      query: query,
      ...params,
    });
  /**
   * @description Use the freezer cgroup to suspend all processes in a container. Traditionally, when suspending a process the `SIGSTOP` signal is used, which is observable by the process being suspended. With the freezer cgroup the process is unaware, and unable to capture, that it is being suspended, and subsequently resumed.
   *
   * @tags Container
   * @name ContainerPause
   * @summary Pause a container
   * @request POST:/containers/{id}/pause
   */
  containerPause = (id: string, params: RequestParams = {}) =>
    this.request<void, ErrorResponse>({
      path: `/containers/${id}/pause`,
      method: "POST",
      ...params,
    });
  /**
   * @description Resume a container which has been paused.
   *
   * @tags Container
   * @name ContainerUnpause
   * @summary Unpause a container
   * @request POST:/containers/{id}/unpause
   */
  containerUnpause = (id: string, params: RequestParams = {}) =>
    this.request<void, ErrorResponse>({
      path: `/containers/${id}/unpause`,
      method: "POST",
      ...params,
    });
  /**
   * @description Attach to a container to read its output or send it input. You can attach to the same container multiple times and you can reattach to containers that have been detached. Either the `stream` or `logs` parameter must be `true` for this endpoint to do anything. See the [documentation for the `docker attach` command](https://docs.docker.com/engine/reference/commandline/attach/) for more details. ### Hijacking This endpoint hijacks the HTTP connection to transport `stdin`, `stdout`, and `stderr` on the same socket. This is the response from the daemon for an attach request: ``` HTTP/1.1 200 OK Content-Type: application/vnd.docker.raw-stream [STREAM] ``` After the headers and two new lines, the TCP connection can now be used for raw, bidirectional communication between the client and server. To hint potential proxies about connection hijacking, the Docker client can also optionally send connection upgrade headers. For example, the client sends this request to upgrade the connection: ``` POST /containers/16253994b7c4/attach?stream=1&stdout=1 HTTP/1.1 Upgrade: tcp Connection: Upgrade ``` The Docker daemon will respond with a `101 UPGRADED` response, and will similarly follow with the raw stream: ``` HTTP/1.1 101 UPGRADED Content-Type: application/vnd.docker.raw-stream Connection: Upgrade Upgrade: tcp [STREAM] ``` ### Stream format When the TTY setting is disabled in [`POST /containers/create`](#operation/ContainerCreate), the HTTP Content-Type header is set to application/vnd.docker.multiplexed-stream and the stream over the hijacked connected is multiplexed to separate out `stdout` and `stderr`. The stream consists of a series of frames, each containing a header and a payload. The header contains the information which the stream writes (`stdout` or `stderr`). It also contains the size of the associated frame encoded in the last four bytes (`uint32`). It is encoded on the first eight bytes like this: ```go header := [8]byte{STREAM_TYPE, 0, 0, 0, SIZE1, SIZE2, SIZE3, SIZE4} ``` `STREAM_TYPE` can be: - 0: `stdin` (is written on `stdout`) - 1: `stdout` - 2: `stderr` `SIZE1, SIZE2, SIZE3, SIZE4` are the four bytes of the `uint32` size encoded as big endian. Following the header is the payload, which is the specified number of bytes of `STREAM_TYPE`. The simplest way to implement this protocol is the following: 1. Read 8 bytes. 2. Choose `stdout` or `stderr` depending on the first byte. 3. Extract the frame size from the last four bytes. 4. Read the extracted size and output it on the correct output. 5. Goto 1. ### Stream format when using a TTY When the TTY setting is enabled in [`POST /containers/create`](#operation/ContainerCreate), the stream is not multiplexed. The data exchanged over the hijacked connection is simply the raw data from the process PTY and client's `stdin`.
   *
   * @tags Container
   * @name ContainerAttach
   * @summary Attach to a container
   * @request POST:/containers/{id}/attach
   */
  containerAttach = (
    id: string,
    query?: {
      /**
       * Override the key sequence for detaching a container.Format is a single
       * character `[a-Z]` or `ctrl-<value>` where `<value>` is one of: `a-z`,
       * `@`, `^`, `[`, `,` or `_`.
       */
      detachKeys?: string;
      /**
       * Replay previous logs from the container.
       *
       * This is useful for attaching to a container that has started and you
       * want to output everything since the container started.
       *
       * If `stream` is also enabled, once all the previous output has been
       * returned, it will seamlessly transition into streaming current
       * output.
       * @default false
       */
      logs?: boolean;
      /**
       * Stream attached streams from the time the request was made onwards.
       * @default false
       */
      stream?: boolean;
      /**
       * Attach to `stdin`
       * @default false
       */
      stdin?: boolean;
      /**
       * Attach to `stdout`
       * @default false
       */
      stdout?: boolean;
      /**
       * Attach to `stderr`
       * @default false
       */
      stderr?: boolean;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, void | ErrorResponse>({
      path: `/containers/${id}/attach`,
      method: "POST",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags Container
   * @name ContainerAttachWebsocket
   * @summary Attach to a container via a websocket
   * @request GET:/containers/{id}/attach/ws
   */
  containerAttachWebsocket = (
    id: string,
    query?: {
      /**
       * Override the key sequence for detaching a container.Format is a single
       * character `[a-Z]` or `ctrl-<value>` where `<value>` is one of: `a-z`,
       * `@`, `^`, `[`, `,`, or `_`.
       */
      detachKeys?: string;
      /**
       * Return logs
       * @default false
       */
      logs?: boolean;
      /**
       * Return stream
       * @default false
       */
      stream?: boolean;
      /**
       * Attach to `stdin`
       * @default false
       */
      stdin?: boolean;
      /**
       * Attach to `stdout`
       * @default false
       */
      stdout?: boolean;
      /**
       * Attach to `stderr`
       * @default false
       */
      stderr?: boolean;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, void | ErrorResponse>({
      path: `/containers/${id}/attach/ws`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * @description Block until a container stops, then returns the exit code.
   *
   * @tags Container
   * @name ContainerWait
   * @summary Wait for a container
   * @request POST:/containers/{id}/wait
   */
  containerWait = (
    id: string,
    query?: {
      /**
       * Wait until a container state reaches the given condition.
       *
       * Defaults to `not-running` if omitted or empty.
       * @default "not-running"
       */
      condition?: "not-running" | "next-exit" | "removed";
    },
    params: RequestParams = {}
  ) =>
    this.request<ContainerWaitResponse, ErrorResponse>({
      path: `/containers/${id}/wait`,
      method: "POST",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Container
   * @name ContainerDelete
   * @summary Remove a container
   * @request DELETE:/containers/{id}
   */
  containerDelete = (
    id: string,
    query?: {
      /**
       * Remove anonymous volumes associated with the container.
       * @default false
       */
      v?: boolean;
      /**
       * If the container is running, kill it before removing it.
       * @default false
       */
      force?: boolean;
      /**
       * Remove the specified link associated with the container.
       * @default false
       */
      link?: boolean;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/containers/${id}`,
      method: "DELETE",
      query: query,
      ...params,
    });
  /**
   * @description A response header `X-Docker-Container-Path-Stat` is returned, containing a base64 - encoded JSON object with some filesystem header information about the path.
   *
   * @tags Container
   * @name ContainerArchiveInfo
   * @summary Get information about files in a container
   * @request HEAD:/containers/{id}/archive
   */
  containerArchiveInfo = (
    id: string,
    query: {
      /** Resource in the container’s filesystem to archive. */
      path: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/containers/${id}/archive`,
      method: "HEAD",
      query: query,
      ...params,
    });
  /**
   * @description Get a tar archive of a resource in the filesystem of container id.
   *
   * @tags Container
   * @name ContainerArchive
   * @summary Get an archive of a filesystem resource in a container
   * @request GET:/containers/{id}/archive
   */
  containerArchive = (
    id: string,
    query: {
      /** Resource in the container’s filesystem to archive. */
      path: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/containers/${id}/archive`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * @description Upload a tar archive to be extracted to a path in the filesystem of container id. `path` parameter is asserted to be a directory. If it exists as a file, 400 error will be returned with message "not a directory".
   *
   * @tags Container
   * @name PutContainerArchive
   * @summary Extract an archive of files or folders to a directory in a container
   * @request PUT:/containers/{id}/archive
   */
  putContainerArchive = (
    id: string,
    query: {
      /** Path to a directory in the container to extract the archive’s contents into.  */
      path: string;
      /**
       * If `1`, `true`, or `True` then it will be an error if unpacking the
       * given content would cause an existing directory to be replaced with
       * a non-directory and vice versa.
       */
      noOverwriteDirNonDir?: string;
      /**
       * If `1`, `true`, then it will copy UID/GID maps to the dest file or
       * dir
       */
      copyUIDGID?: string;
    },
    inputStream: File,
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/containers/${id}/archive`,
      method: "PUT",
      query: query,
      body: inputStream,
      ...params,
    });
  /**
   * No description
   *
   * @tags Container
   * @name ContainerPrune
   * @summary Delete stopped containers
   * @request POST:/containers/prune
   */
  containerPrune = (
    query?: {
      /**
       * Filters to process on the prune list, encoded as JSON (a `map[string][]string`).
       *
       * Available filters:
       * - `until=<timestamp>` Prune containers created before this timestamp. The `<timestamp>` can be Unix timestamps, date formatted timestamps, or Go duration strings (e.g. `10m`, `1h30m`) computed relative to the daemon machine’s time.
       * - `label` (`label=<key>`, `label=<key>=<value>`, `label!=<key>`, or `label!=<key>=<value>`) Prune containers with (or without, in case `label!=...` is used) the specified labels.
       */
      filters?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<
      {
        /** Container IDs that were deleted */
        ContainersDeleted?: string[];
        /**
         * Disk space reclaimed in bytes
         * @format int64
         */
        SpaceReclaimed?: number;
      },
      ErrorResponse
    >({
      path: `/containers/prune`,
      method: "POST",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Run a command inside a running container.
   *
   * @tags Exec
   * @name ContainerExec
   * @summary Create an exec instance
   * @request POST:/containers/{id}/exec
   */
  containerExec = (
    id: string,
    execConfig: {
      /** Attach to `stdin` of the exec command. */
      AttachStdin?: boolean;
      /** Attach to `stdout` of the exec command. */
      AttachStdout?: boolean;
      /** Attach to `stderr` of the exec command. */
      AttachStderr?: boolean;
      /**
       * Initial console size, as an `[height, width]` array.
       * @maxItems 2
       * @minItems 2
       * @example [80,64]
       */
      ConsoleSize?: number[] | null;
      /**
       * Override the key sequence for detaching a container. Format is
       * a single character `[a-Z]` or `ctrl-<value>` where `<value>`
       * is one of: `a-z`, `@`, `^`, `[`, `,` or `_`.
       */
      DetachKeys?: string;
      /** Allocate a pseudo-TTY. */
      Tty?: boolean;
      /** A list of environment variables in the form `["VAR=value", ...]`. */
      Env?: string[];
      /** Command to run, as a string or array of strings. */
      Cmd?: string[];
      /**
       * Runs the exec process with extended privileges.
       * @default false
       */
      Privileged?: boolean;
      /**
       * The user, and optionally, group to run the exec process inside
       * the container. Format is one of: `user`, `user:group`, `uid`,
       * or `uid:gid`.
       */
      User?: string;
      /** The working directory for the exec process inside the container. */
      WorkingDir?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<IDResponse, ErrorResponse>({
      path: `/containers/${id}/exec`,
      method: "POST",
      body: execConfig,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
}
