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
  BuildCacheDiskUsage,
  ContainersDiskUsage,
  ErrorResponse,
  ImagesDiskUsage,
  VolumesDiskUsage,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class System<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags System
   * @name SystemDataUsage
   * @summary Get data usage information
   * @request GET:/system/df
   */
  systemDataUsage = (
    query?: {
      /** Object types, for which to compute and return data. */
      type?: ("container" | "image" | "volume" | "build-cache")[];
      /**
       * Show detailed information on space usage.
       * @default false
       */
      verbose?: boolean;
    },
    params: RequestParams = {}
  ) =>
    this.request<
      {
        /** represents system data usage for image resources. */
        ImagesDiskUsage?: ImagesDiskUsage;
        /** represents system data usage information for container resources. */
        ContainersDiskUsage?: ContainersDiskUsage;
        /** represents system data usage for volume resources. */
        VolumesDiskUsage?: VolumesDiskUsage;
        /** represents system data usage for build cache resources. */
        BuildCacheDiskUsage?: BuildCacheDiskUsage;
      },
      ErrorResponse
    >({
      path: `/system/df`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
}
