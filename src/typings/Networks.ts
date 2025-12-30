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
  ConfigReference,
  ErrorResponse,
  IPAM,
  NetworkConnectRequest,
  NetworkCreateResponse,
  NetworkDisconnectRequest,
  NetworkInspect,
  NetworkSummary,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Networks<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Returns a list of networks. For details on the format, see the [network inspect endpoint](#operation/NetworkInspect). Note that it uses a different, smaller representation of a network than inspecting a single network. For example, the list of containers attached to the network is not propagated in API versions 1.28 and up.
   *
   * @tags Network
   * @name NetworkList
   * @summary List networks
   * @request GET:/networks
   */
  networkList = (
    query?: {
      /**
       * JSON encoded value of the filters (a `map[string][]string`) to process
       * on the networks list.
       *
       * Available filters:
       *
       * - `dangling=<boolean>` When set to `true` (or `1`), returns all
       *    networks that are not in use by a container. When set to `false`
       *    (or `0`), only networks that are in use by one or more
       *    containers are returned.
       * - `driver=<driver-name>` Matches a network's driver.
       * - `id=<network-id>` Matches all or part of a network ID.
       * - `label=<key>` or `label=<key>=<value>` of a network label.
       * - `name=<network-name>` Matches all or part of a network name.
       * - `scope=["swarm"|"global"|"local"]` Filters networks by scope (`swarm`, `global`, or `local`).
       * - `type=["custom"|"builtin"]` Filters networks by type. The `custom` keyword returns all user-defined networks.
       */
      filters?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<NetworkSummary[], ErrorResponse>({
      path: `/networks`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Network
   * @name NetworkInspect
   * @summary Inspect a network
   * @request GET:/networks/{id}
   */
  networkInspect = (
    id: string,
    query?: {
      /**
       * Detailed inspect output for troubleshooting
       * @default false
       */
      verbose?: boolean;
      /** Filter the network by scope (swarm, global, or local) */
      scope?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<NetworkInspect, ErrorResponse>({
      path: `/networks/${id}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Network
   * @name NetworkDelete
   * @summary Remove a network
   * @request DELETE:/networks/{id}
   */
  networkDelete = (id: string, params: RequestParams = {}) =>
    this.request<void, ErrorResponse>({
      path: `/networks/${id}`,
      method: "DELETE",
      ...params,
    });
  /**
   * No description
   *
   * @tags Network
   * @name NetworkCreate
   * @summary Create a network
   * @request POST:/networks/create
   */
  networkCreate = (
    networkConfig: {
      /**
       * The network's name.
       * @example "my_network"
       */
      Name: string;
      /**
       * Name of the network driver plugin to use.
       * @default "bridge"
       * @example "bridge"
       */
      Driver?: string;
      /**
       * The level at which the network exists (e.g. `swarm` for cluster-wide
       * or `local` for machine level).
       */
      Scope?: string;
      /** Restrict external access to the network. */
      Internal?: boolean;
      /**
       * Globally scoped network is manually attachable by regular
       * containers from workers in swarm mode.
       * @example true
       */
      Attachable?: boolean;
      /**
       * Ingress network is the network which provides the routing-mesh
       * in swarm mode.
       * @example false
       */
      Ingress?: boolean;
      /**
       * Creates a config-only network. Config-only networks are placeholder
       * networks for network configurations to be used by other networks.
       * Config-only networks cannot be used directly to run containers
       * or services.
       * @default false
       * @example false
       */
      ConfigOnly?: boolean;
      /**
       * Specifies the source which will provide the configuration for
       * this network. The specified network must be an existing
       * config-only network; see ConfigOnly.
       */
      ConfigFrom?: ConfigReference;
      /** Optional custom IP scheme for the network. */
      IPAM?: IPAM;
      /**
       * Enable IPv4 on the network.
       * @example true
       */
      EnableIPv4?: boolean;
      /**
       * Enable IPv6 on the network.
       * @example true
       */
      EnableIPv6?: boolean;
      /**
       * Network specific options to be used by the drivers.
       * @example {"com.docker.network.bridge.default_bridge":"true","com.docker.network.bridge.enable_icc":"true","com.docker.network.bridge.enable_ip_masquerade":"true","com.docker.network.bridge.host_binding_ipv4":"0.0.0.0","com.docker.network.bridge.name":"docker0","com.docker.network.driver.mtu":"1500"}
       */
      Options?: Record<string, string>;
      /**
       * User-defined key/value metadata.
       * @example {"com.example.some-label":"some-value","com.example.some-other-label":"some-other-value"}
       */
      Labels?: Record<string, string>;
    },
    params: RequestParams = {},
  ) =>
    this.request<NetworkCreateResponse, ErrorResponse>({
      path: `/networks/create`,
      method: "POST",
      body: networkConfig,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description The network must be either a local-scoped network or a swarm-scoped network with the `attachable` option set. A network cannot be re-attached to a running container
   *
   * @tags Network
   * @name NetworkConnect
   * @summary Connect a container to a network
   * @request POST:/networks/{id}/connect
   */
  networkConnect = (
    id: string,
    container: NetworkConnectRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, ErrorResponse>({
      path: `/networks/${id}/connect`,
      method: "POST",
      body: container,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Network
   * @name NetworkDisconnect
   * @summary Disconnect a container from a network
   * @request POST:/networks/{id}/disconnect
   */
  networkDisconnect = (
    id: string,
    container: NetworkDisconnectRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, ErrorResponse>({
      path: `/networks/${id}/disconnect`,
      method: "POST",
      body: container,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Network
   * @name NetworkPrune
   * @summary Delete unused networks
   * @request POST:/networks/prune
   */
  networkPrune = (
    query?: {
      /**
       * Filters to process on the prune list, encoded as JSON (a `map[string][]string`).
       *
       * Available filters:
       * - `until=<timestamp>` Prune networks created before this timestamp. The `<timestamp>` can be Unix timestamps, date formatted timestamps, or Go duration strings (e.g. `10m`, `1h30m`) computed relative to the daemon machine’s time.
       * - `label` (`label=<key>`, `label=<key>=<value>`, `label!=<key>`, or `label!=<key>=<value>`) Prune networks with (or without, in case `label!=...` is used) the specified labels.
       */
      filters?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** Networks that were deleted */
        NetworksDeleted?: string[];
      },
      ErrorResponse
    >({
      path: `/networks/prune`,
      method: "POST",
      query: query,
      format: "json",
      ...params,
    });
}
