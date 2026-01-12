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

import { ErrorResponse, SystemInfo } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Info<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags System
   * @name SystemInfo
   * @summary Get system information
   * @request GET:/info
   */
  systemInfo = (params: RequestParams = {}) =>
    this.request<SystemInfo, ErrorResponse>({
      path: `/info`,
      method: "GET",
      format: "json",
      ...params,
    });
}
