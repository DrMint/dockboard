/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { ErrorResponse } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Build<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Build an image from a tar archive with a `Dockerfile` in it. The `Dockerfile` specifies how the image is built from the tar archive. It is typically in the archive's root, but can be at a different path or have a different name by specifying the `dockerfile` parameter. [See the `Dockerfile` reference for more information](https://docs.docker.com/engine/reference/builder/). The Docker daemon performs a preliminary validation of the `Dockerfile` before starting the build, and returns an error if the syntax is incorrect. After that, each instruction is run one-by-one until the ID of the new image is output. The build is canceled if the client drops the connection by quitting or being killed.
   *
   * @tags Image
   * @name ImageBuild
   * @summary Build an image
   * @request POST:/build
   */
  imageBuild = (
    inputStream: File,
    query?: {
      /**
       * Path within the build context to the `Dockerfile`. This is ignored if `remote` is specified and points to an external `Dockerfile`.
       * @default "Dockerfile"
       */
      dockerfile?: string;
      /** A name and optional tag to apply to the image in the `name:tag` format. If you omit the tag the default `latest` value is assumed. You can provide several `t` parameters. */
      t?: string;
      /** Extra hosts to add to /etc/hosts */
      extrahosts?: string;
      /** A Git repository URI or HTTP/HTTPS context URI. If the URI points to a single text file, the file’s contents are placed into a file called `Dockerfile` and the image is built from that file. If the URI points to a tarball, the file is downloaded by the daemon and the contents therein used as the context for the build. If the URI points to a tarball and the `dockerfile` parameter is also specified, there must be a file with the corresponding path inside the tarball. */
      remote?: string;
      /**
       * Suppress verbose build output.
       * @default false
       */
      q?: boolean;
      /**
       * Do not use the cache when building the image.
       * @default false
       */
      nocache?: boolean;
      /** JSON array of images used for build cache resolution. */
      cachefrom?: string;
      /** Attempt to pull the image even if an older image exists locally. */
      pull?: string;
      /**
       * Remove intermediate containers after a successful build.
       * @default true
       */
      rm?: boolean;
      /**
       * Always remove intermediate containers, even upon failure.
       * @default false
       */
      forcerm?: boolean;
      /** Set memory limit for build. */
      memory?: number;
      /** Total memory (memory + swap). Set as `-1` to disable swap. */
      memswap?: number;
      /** CPU shares (relative weight). */
      cpushares?: number;
      /** CPUs in which to allow execution (e.g., `0-3`, `0,1`). */
      cpusetcpus?: string;
      /** The length of a CPU period in microseconds. */
      cpuperiod?: number;
      /** Microseconds of CPU time that the container can get in a CPU period. */
      cpuquota?: number;
      /**
       * JSON map of string pairs for build-time variables. Users pass these values at build-time. Docker uses the buildargs as the environment context for commands run via the `Dockerfile` RUN instruction, or for variable expansion in other `Dockerfile` instructions. This is not meant for passing secret values.
       *
       * For example, the build arg `FOO=bar` would become `{"FOO":"bar"}` in JSON. This would result in the query parameter `buildargs={"FOO":"bar"}`. Note that `{"FOO":"bar"}` should be URI component encoded.
       *
       * [Read more about the buildargs instruction.](https://docs.docker.com/engine/reference/builder/#arg)
       */
      buildargs?: string;
      /** Size of `/dev/shm` in bytes. The size must be greater than 0. If omitted the system uses 64MB. */
      shmsize?: number;
      /** Squash the resulting images layers into a single layer. *(Experimental release only.)* */
      squash?: boolean;
      /** Arbitrary key/value labels to set on the image, as a JSON map of string pairs. */
      labels?: string;
      /**
       * Sets the networking mode for the run commands during build. Supported
       * standard values are: `bridge`, `host`, `none`, and `container:<name|id>`.
       * Any other value is taken as a custom network's name or ID to which this
       * container should connect to.
       */
      networkmode?: string;
      /**
       * Platform in the format os[/arch[/variant]]
       * @default ""
       */
      platform?: string;
      /**
       * Target build stage
       * @default ""
       */
      target?: string;
      /**
       * BuildKit output configuration in the format of a stringified JSON array of objects.
       * Each object must have two top-level properties: `Type` and `Attrs`.
       * The `Type` property must be set to 'moby'.
       * The `Attrs` property is a map of attributes for the BuildKit output configuration.
       * See https://docs.docker.com/build/exporters/oci-docker/ for more information.
       *
       * Example:
       *
       * ```
       * [{"Type":"moby","Attrs":{"type":"image","force-compression":"true","compression":"zstd"}}]
       * ```
       * @default ""
       */
      outputs?: string;
      /**
       * Version of the builder backend to use.
       *
       * - `1` is the first generation classic (deprecated) builder in the Docker daemon (default)
       * - `2` is [BuildKit](https://github.com/moby/buildkit)
       * @default "1"
       */
      version?: "1" | "2";
    },
    params: RequestParams = {},
  ) =>
    this.request<void, ErrorResponse>({
      path: `/build`,
      method: "POST",
      query: query,
      body: inputStream,
      ...params,
    });
  /**
   * No description
   *
   * @tags Image
   * @name BuildPrune
   * @summary Delete builder cache
   * @request POST:/build/prune
   */
  buildPrune = (
    query?: {
      /**
       * Amount of disk space in bytes to keep for cache
       * @format int64
       */
      "reserved-space"?: number;
      /**
       * Maximum amount of disk space allowed to keep for cache
       * @format int64
       */
      "max-used-space"?: number;
      /**
       * Target amount of free disk space after pruning
       * @format int64
       */
      "min-free-space"?: number;
      /** Remove all types of build cache */
      all?: boolean;
      /**
       * A JSON encoded value of the filters (a `map[string][]string`) to
       * process on the list of build cache objects.
       *
       * Available filters:
       *
       * - `until=<timestamp>` remove cache older than `<timestamp>`. The `<timestamp>` can be Unix timestamps, date formatted timestamps, or Go duration strings (e.g. `10m`, `1h30m`) computed relative to the daemon's local time.
       * - `id=<id>`
       * - `parent=<id>`
       * - `type=<string>`
       * - `description=<string>`
       * - `inuse`
       * - `shared`
       * - `private`
       */
      filters?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        CachesDeleted?: string[];
        /**
         * Disk space reclaimed in bytes
         * @format int64
         */
        SpaceReclaimed?: number;
      },
      ErrorResponse
    >({
      path: `/build/prune`,
      method: "POST",
      query: query,
      format: "json",
      ...params,
    });
}
