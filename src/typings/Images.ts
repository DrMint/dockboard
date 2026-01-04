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

import {
  ErrorResponse,
  ImageDeleteResponseItem,
  ImageInspect,
  ImageSummary,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Images<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Returns a list of images on the server. Note that it uses a different, smaller representation of an image than inspecting a single image.
   *
   * @tags Image
   * @name ImageList
   * @summary List Images
   * @request GET:/images/json
   */
  imageList = (
    query?: {
      /**
       * Show all images. Only images from a final layer (no children) are shown by default.
       * @default false
       */
      all?: boolean;
      /**
       * A JSON encoded value of the filters (a `map[string][]string`) to
       * process on the images list.
       *
       * Available filters:
       *
       * - `before`=(`<image-name>[:<tag>]`,  `<image id>` or `<image@digest>`)
       * - `dangling=true`
       * - `label=key` or `label="key=value"` of an image label
       * - `reference`=(`<image-name>[:<tag>]`)
       * - `since`=(`<image-name>[:<tag>]`,  `<image id>` or `<image@digest>`)
       * - `until=<timestamp>`
       */
      filters?: string;
      /**
       * Compute and show shared size as a `SharedSize` field on each image.
       * @default false
       */
      "shared-size"?: boolean;
      /**
       * Show digest information as a `RepoDigests` field on each image.
       * @default false
       */
      digests?: boolean;
      /**
       * Include `Manifests` in the image summary.
       * @default false
       */
      manifests?: boolean;
    },
    params: RequestParams = {}
  ) =>
    this.request<ImageSummary[], ErrorResponse>({
      path: `/images/json`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Pull or import an image.
   *
   * @tags Image
   * @name ImageCreate
   * @summary Create an image
   * @request POST:/images/create
   */
  imageCreate = (
    inputImage: string,
    query?: {
      /**
       * Name of the image to pull. If the name includes a tag or digest, specific behavior applies:
       *
       * - If only `fromImage` includes a tag, that tag is used.
       * - If both `fromImage` and `tag` are provided, `tag` takes precedence.
       * - If `fromImage` includes a digest, the image is pulled by digest, and `tag` is ignored.
       * - If neither a tag nor digest is specified, all tags are pulled.
       */
      fromImage?: string;
      /** Source to import. The value may be a URL from which the image can be retrieved or `-` to read the image from the request body. This parameter may only be used when importing an image. */
      fromSrc?: string;
      /** Repository name given to an image when it is imported. The repo may include a tag. This parameter may only be used when importing an image. */
      repo?: string;
      /** Tag or digest. If empty when pulling an image, this causes all tags for the given image to be pulled. */
      tag?: string;
      /** Set commit message for imported image. */
      message?: string;
      /**
       * Apply `Dockerfile` instructions to the image that is created,
       * for example: `changes=ENV DEBUG=true`.
       * Note that `ENV DEBUG=true` should be URI component encoded.
       *
       * Supported `Dockerfile` instructions:
       * `CMD`|`ENTRYPOINT`|`ENV`|`EXPOSE`|`ONBUILD`|`USER`|`VOLUME`|`WORKDIR`
       */
      changes?: string[];
      /**
       * Platform in the format os[/arch[/variant]].
       *
       * When used in combination with the `fromImage` option, the daemon checks
       * if the given image is present in the local image cache with the given
       * OS and Architecture, and otherwise attempts to pull the image. If the
       * option is not set, the host's native OS and Architecture are used.
       * If the given image does not exist in the local image cache, the daemon
       * attempts to pull the image with the host's native OS and Architecture.
       * If the given image does exists in the local image cache, but its OS or
       * architecture does not match, a warning is produced.
       *
       * When used with the `fromSrc` option to import an image from an archive,
       * this option sets the platform information for the imported image. If
       * the option is not set, the host's native OS and Architecture are used
       * for the imported image.
       * @default ""
       */
      platform?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/images/create`,
      method: "POST",
      query: query,
      body: inputImage,
      type: ContentType.Text,
      ...params,
    });
  /**
   * @description Return low-level information about an image.
   *
   * @tags Image
   * @name ImageInspect
   * @summary Inspect an image
   * @request GET:/images/{name}/json
   */
  imageInspect = (
    name: string,
    query?: {
      /**
       * Include Manifests in the image summary.
       * @default false
       */
      manifests?: boolean;
    },
    params: RequestParams = {}
  ) =>
    this.request<ImageInspect, ErrorResponse>({
      path: `/images/${name}/json`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Return parent layers of an image.
   *
   * @tags Image
   * @name ImageHistory
   * @summary Get the history of an image
   * @request GET:/images/{name}/history
   */
  imageHistory = (
    name: string,
    query?: {
      /**
       * JSON-encoded OCI platform to select the platform-variant.
       * If omitted, it defaults to any locally available platform,
       * prioritizing the daemon's host platform.
       *
       * If the daemon provides a multi-platform image store, this selects
       * the platform-variant to show the history for. If the image is
       * a single-platform image, or if the multi-platform image does not
       * provide a variant matching the given platform, an error is returned.
       *
       * Example: `{"os": "linux", "architecture": "arm", "variant": "v5"}`
       */
      platform?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<
      {
        Id: string;
        /** @format int64 */
        Created: number;
        CreatedBy: string;
        Tags: string[];
        /** @format int64 */
        Size: number;
        Comment: string;
      }[],
      ErrorResponse
    >({
      path: `/images/${name}/history`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Remove an image, along with any untagged parent images that were referenced by that image. Images can't be removed if they have descendant images, are being used by a running container or are being used by a build.
   *
   * @tags Image
   * @name ImageDelete
   * @summary Remove an image
   * @request DELETE:/images/{name}
   */
  imageDelete = (
    name: string,
    query?: {
      /**
       * Remove the image even if it is being used by stopped containers or has other tags
       * @default false
       */
      force?: boolean;
      /**
       * Do not delete untagged parent images
       * @default false
       */
      noprune?: boolean;
      /**
       * Select platform-specific content to delete.
       * Multiple values are accepted.
       * Each platform is a OCI platform encoded as a JSON string.
       */
      platforms?: string[];
    },
    params: RequestParams = {}
  ) =>
    this.request<ImageDeleteResponseItem[], ErrorResponse>({
      path: `/images/${name}`,
      method: "DELETE",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Search for an image on Docker Hub.
   *
   * @tags Image
   * @name ImageSearch
   * @summary Search images
   * @request GET:/images/search
   */
  imageSearch = (
    query: {
      /** Term to search */
      term: string;
      /** Maximum number of results to return */
      limit?: number;
      /**
       * A JSON encoded value of the filters (a `map[string][]string`) to process on the images list. Available filters:
       *
       * - `is-official=(true|false)`
       * - `stars=<number>` Matches images that has at least 'number' stars.
       */
      filters?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<
      {
        description?: string;
        is_official?: boolean;
        /**
         * Whether this repository has automated builds enabled.
         *
         * <p><br /></p>
         *
         * > **Deprecated**: This field is deprecated and will always be "false".
         * @example false
         */
        is_automated?: boolean;
        name?: string;
        star_count?: number;
      }[],
      ErrorResponse
    >({
      path: `/images/search`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Image
   * @name ImagePrune
   * @summary Delete unused images
   * @request POST:/images/prune
   */
  imagePrune = (
    query?: {
      /**
       * Filters to process on the prune list, encoded as JSON (a `map[string][]string`). Available filters:
       *
       * - `dangling=<boolean>` When set to `true` (or `1`), prune only
       *    unused *and* untagged images. When set to `false`
       *    (or `0`), all unused images are pruned.
       * - `until=<string>` Prune images created before this timestamp. The `<timestamp>` can be Unix timestamps, date formatted timestamps, or Go duration strings (e.g. `10m`, `1h30m`) computed relative to the daemon machine’s time.
       * - `label` (`label=<key>`, `label=<key>=<value>`, `label!=<key>`, or `label!=<key>=<value>`) Prune images with (or without, in case `label!=...` is used) the specified labels.
       */
      filters?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<
      {
        /** Images that were deleted */
        ImagesDeleted?: ImageDeleteResponseItem[];
        /**
         * Disk space reclaimed in bytes
         * @format int64
         */
        SpaceReclaimed?: number;
      },
      ErrorResponse
    >({
      path: `/images/prune`,
      method: "POST",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Get a tarball containing all images and metadata for a repository. If `name` is a specific name and tag (e.g. `ubuntu:latest`), then only that image (and its parents) are returned. If `name` is an image ID, similarly only that image (and its parents) are returned, but with the exclusion of the `repositories` file in the tarball, as there were no image names referenced. ### Image tarball format An image tarball contains [Content as defined in the OCI Image Layout Specification](https://github.com/opencontainers/image-spec/blob/v1.1.1/image-layout.md#content). Additionally, includes the manifest.json file associated with a backwards compatible docker save format. If the tarball defines a repository, the tarball should also include a `repositories` file at the root that contains a list of repository and tag names mapped to layer IDs. ```json { "hello-world": { "latest": "565a9d68a73f6706862bfe8409a7f659776d4d60a8d096eb4a3cbce6999cc2a1" } } ```
   *
   * @tags Image
   * @name ImageGet
   * @summary Export an image
   * @request GET:/images/{name}/get
   */
  imageGet = (
    name: string,
    query?: {
      /**
       * JSON encoded OCI platform describing a platform which will be used
       * to select a platform-specific image to be saved if the image is
       * multi-platform.
       * If not provided, the full multi-platform image will be saved.
       *
       * Example: `{"os": "linux", "architecture": "arm", "variant": "v5"}`
       */
      platform?: string[];
    },
    params: RequestParams = {}
  ) =>
    this.request<File, ErrorResponse>({
      path: `/images/${name}/get`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * @description Get a tarball containing all images and metadata for several image repositories. For each value of the `names` parameter: if it is a specific name and tag (e.g. `ubuntu:latest`), then only that image (and its parents) are returned; if it is an image ID, similarly only that image (and its parents) are returned and there would be no names referenced in the 'repositories' file for this image ID. For details on the format, see the [export image endpoint](#operation/ImageGet).
   *
   * @tags Image
   * @name ImageGetAll
   * @summary Export several images
   * @request GET:/images/get
   */
  imageGetAll = (
    query?: {
      /** Image names to filter by */
      names?: string[];
      /**
       * JSON encoded OCI platform(s) which will be used to select the
       * platform-specific image(s) to be saved if the image is
       * multi-platform. If not provided, the full multi-platform image
       * will be saved.
       *
       * Example: `{"os": "linux", "architecture": "arm", "variant": "v5"}`
       */
      platform?: string[];
    },
    params: RequestParams = {}
  ) =>
    this.request<File, ErrorResponse>({
      path: `/images/get`,
      method: "GET",
      query: query,
      ...params,
    });
}
