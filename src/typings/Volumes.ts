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
  ClusterVolumeSpec,
  ErrorResponse,
  Volume,
  VolumeCreateRequest,
  VolumeListResponse,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Volumes<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Volume
   * @name VolumeList
   * @summary List volumes
   * @request GET:/volumes
   */
  volumeList = (
    query?: {
      /**
       * JSON encoded value of the filters (a `map[string][]string`) to
       * process on the volumes list. Available filters:
       *
       * - `dangling=<boolean>` When set to `true` (or `1`), returns all
       *    volumes that are not in use by a container. When set to `false`
       *    (or `0`), only volumes that are in use by one or more
       *    containers are returned.
       * - `driver=<volume-driver-name>` Matches volumes based on their driver.
       * - `label=<key>` or `label=<key>:<value>` Matches volumes based on
       *    the presence of a `label` alone or a `label` and a value.
       * - `name=<volume-name>` Matches all or part of a volume name.
       * @format json
       */
      filters?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<VolumeListResponse, ErrorResponse>({
      path: `/volumes`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Volume
   * @name VolumeCreate
   * @summary Create a volume
   * @request POST:/volumes/create
   */
  volumeCreate = (volumeConfig: VolumeCreateRequest, params: RequestParams = {}) =>
    this.request<Volume, ErrorResponse>({
      path: `/volumes/create`,
      method: "POST",
      body: volumeConfig,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Volume
   * @name VolumeInspect
   * @summary Inspect a volume
   * @request GET:/volumes/{name}
   */
  volumeInspect = (name: string, params: RequestParams = {}) =>
    this.request<Volume, ErrorResponse>({
      path: `/volumes/${name}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Instruct the driver to remove the volume.
   *
   * @tags Volume
   * @name VolumeDelete
   * @summary Remove a volume
   * @request DELETE:/volumes/{name}
   */
  volumeDelete = (
    name: string,
    query?: {
      /**
       * Force the removal of the volume
       * @default false
       */
      force?: boolean;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/volumes/${name}`,
      method: "DELETE",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags Volume
   * @name VolumePrune
   * @summary Delete unused volumes
   * @request POST:/volumes/prune
   */
  volumePrune = (
    query?: {
      /**
       * Filters to process on the prune list, encoded as JSON (a `map[string][]string`).
       *
       * Available filters:
       * - `label` (`label=<key>`, `label=<key>=<value>`, `label!=<key>`, or `label!=<key>=<value>`) Prune volumes with (or without, in case `label!=...` is used) the specified labels.
       * - `all` (`all=true`) - Consider all (local) volumes for pruning and not just anonymous volumes.
       */
      filters?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<
      {
        /** Volumes that were deleted */
        VolumesDeleted?: string[];
        /**
         * Disk space reclaimed in bytes
         * @format int64
         */
        SpaceReclaimed?: number;
      },
      ErrorResponse
    >({
      path: `/volumes/prune`,
      method: "POST",
      query: query,
      format: "json",
      ...params,
    });
}
