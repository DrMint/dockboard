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

import { ErrorResponse, EventMessage } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Events<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Stream real-time events from the server. Various objects within Docker report events when something happens to them. Containers report these events: `attach`, `commit`, `copy`, `create`, `destroy`, `detach`, `die`, `exec_create`, `exec_detach`, `exec_start`, `exec_die`, `export`, `health_status`, `kill`, `oom`, `pause`, `rename`, `resize`, `restart`, `start`, `stop`, `top`, `unpause`, `update`, and `prune` Images report these events: `create`, `delete`, `import`, `load`, `pull`, `push`, `save`, `tag`, `untag`, and `prune` Volumes report these events: `create`, `mount`, `unmount`, `destroy`, and `prune` Networks report these events: `create`, `connect`, `disconnect`, `destroy`, `update`, `remove`, and `prune` The Docker daemon reports these events: `reload` Services report these events: `create`, `update`, and `remove` Nodes report these events: `create`, `update`, and `remove` Secrets report these events: `create`, `update`, and `remove` Configs report these events: `create`, `update`, and `remove` The Builder reports `prune` events
   *
   * @tags System
   * @name SystemEvents
   * @summary Monitor events
   * @request GET:/events
   */
  systemEvents = (
    query?: {
      /** Show events created since this timestamp then stream new events. */
      since?: string;
      /** Show events created until this timestamp then stop streaming. */
      until?: string;
      /**
       * A JSON encoded value of filters (a `map[string][]string`) to process on the event list. Available filters:
       *
       * - `config=<string>` config name or ID
       * - `container=<string>` container name or ID
       * - `daemon=<string>` daemon name or ID
       * - `event=<string>` event type
       * - `image=<string>` image name or ID
       * - `label=<string>` image or container label
       * - `network=<string>` network name or ID
       * - `node=<string>` node ID
       * - `plugin`=<string> plugin name or ID
       * - `scope`=<string> local or swarm
       * - `secret=<string>` secret name or ID
       * - `service=<string>` service name or ID
       * - `type=<string>` object to filter by, one of `container`, `image`, `volume`, `network`, `daemon`, `plugin`, `node`, `service`, `secret` or `config`
       * - `volume=<string>` volume name
       */
      filters?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<EventMessage, ErrorResponse>({
      path: `/events`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
}
