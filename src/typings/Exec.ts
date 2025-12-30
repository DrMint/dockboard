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

import { ErrorResponse, ProcessConfig } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Exec<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Starts a previously set up exec instance. If detach is true, this endpoint returns immediately after starting the command. Otherwise, it sets up an interactive session with the command.
   *
   * @tags Exec
   * @name ExecStart
   * @summary Start an exec instance
   * @request POST:/exec/{id}/start
   */
  execStart = (
    id: string,
    execStartConfig: {
      /**
       * Detach from the command.
       * @example false
       */
      Detach?: boolean;
      /**
       * Allocate a pseudo-TTY.
       * @example true
       */
      Tty?: boolean;
      /**
       * Initial console size, as an `[height, width]` array.
       * @maxItems 2
       * @minItems 2
       * @example [80,64]
       */
      ConsoleSize?: number[] | null;
    },
    params: RequestParams = {},
  ) =>
    this.request<void, ErrorResponse>({
      path: `/exec/${id}/start`,
      method: "POST",
      body: execStartConfig,
      type: ContentType.Json,
      ...params,
    });
  /**
   * @description Resize the TTY session used by an exec instance. This endpoint only works if `tty` was specified as part of creating and starting the exec instance.
   *
   * @tags Exec
   * @name ExecResize
   * @summary Resize an exec instance
   * @request POST:/exec/{id}/resize
   */
  execResize = (
    id: string,
    query: {
      /** Height of the TTY session in characters */
      h: number;
      /** Width of the TTY session in characters */
      w: number;
    },
    params: RequestParams = {},
  ) =>
    this.request<void, ErrorResponse>({
      path: `/exec/${id}/resize`,
      method: "POST",
      query: query,
      ...params,
    });
  /**
   * @description Return low-level information about an exec instance.
   *
   * @tags Exec
   * @name ExecInspect
   * @summary Inspect an exec instance
   * @request GET:/exec/{id}/json
   */
  execInspect = (id: string, params: RequestParams = {}) =>
    this.request<
      {
        CanRemove?: boolean;
        DetachKeys?: string;
        ID?: string;
        Running?: boolean;
        ExitCode?: number;
        ProcessConfig?: ProcessConfig;
        OpenStdin?: boolean;
        OpenStderr?: boolean;
        OpenStdout?: boolean;
        ContainerID?: string;
        /** The system process ID for the exec process. */
        Pid?: number;
      },
      ErrorResponse
    >({
      path: `/exec/${id}/json`,
      method: "GET",
      format: "json",
      ...params,
    });
}
