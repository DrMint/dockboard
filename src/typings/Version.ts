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

import { ErrorResponse, SystemVersion } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Version<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Returns the version of Docker that is running and various information about the system that Docker is running on.
   *
   * @tags System
   * @name SystemVersion
   * @summary Get version
   * @request GET:/version
   */
  systemVersion = (params: RequestParams = {}) =>
    this.request<SystemVersion, ErrorResponse>({
      path: `/version`,
      method: "GET",
      format: "json",
      ...params,
    });
}
