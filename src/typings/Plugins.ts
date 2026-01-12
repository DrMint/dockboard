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

import { ErrorResponse, Plugin, PluginPrivilege } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Plugins<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Returns information about installed plugins.
   *
   * @tags Plugin
   * @name PluginList
   * @summary List plugins
   * @request GET:/plugins
   */
  pluginList = (
    query?: {
      /**
       * A JSON encoded value of the filters (a `map[string][]string`) to
       * process on the plugin list.
       *
       * Available filters:
       *
       * - `capability=<capability name>`
       * - `enable=<true>|<false>`
       */
      filters?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<Plugin[], ErrorResponse>({
      path: `/plugins`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Plugin
   * @name GetPluginPrivileges
   * @summary Get plugin privileges
   * @request GET:/plugins/privileges
   */
  getPluginPrivileges = (
    query: {
      /**
       * The name of the plugin. The `:latest` tag is optional, and is the
       * default if omitted.
       */
      remote: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PluginPrivilege[], ErrorResponse>({
      path: `/plugins/privileges`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Pulls and installs a plugin. After the plugin is installed, it can be enabled using the [`POST /plugins/{name}/enable` endpoint](#operation/PostPluginsEnable).
   *
   * @tags Plugin
   * @name PluginPull
   * @summary Install a plugin
   * @request POST:/plugins/pull
   */
  pluginPull = (
    query: {
      /**
       * Remote reference for plugin to install.
       *
       * The `:latest` tag is optional, and is used as the default if omitted.
       */
      remote: string;
      /**
       * Local name for the pulled plugin.
       *
       * The `:latest` tag is optional, and is used as the default if omitted.
       */
      name?: string;
    },
    body: PluginPrivilege[],
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/plugins/pull`,
      method: "POST",
      query: query,
      body: body,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Plugin
   * @name PluginInspect
   * @summary Inspect a plugin
   * @request GET:/plugins/{name}/json
   */
  pluginInspect = (name: string, params: RequestParams = {}) =>
    this.request<Plugin, ErrorResponse>({
      path: `/plugins/${name}/json`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Plugin
   * @name PluginDelete
   * @summary Remove a plugin
   * @request DELETE:/plugins/{name}
   */
  pluginDelete = (
    name: string,
    query?: {
      /**
       * Disable the plugin before removing. This may result in issues if the
       * plugin is in use by a container.
       * @default false
       */
      force?: boolean;
    },
    params: RequestParams = {}
  ) =>
    this.request<Plugin, ErrorResponse>({
      path: `/plugins/${name}`,
      method: "DELETE",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Plugin
   * @name PluginEnable
   * @summary Enable a plugin
   * @request POST:/plugins/{name}/enable
   */
  pluginEnable = (
    name: string,
    query?: {
      /**
       * Set the HTTP client timeout (in seconds)
       * @default 0
       */
      timeout?: number;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/plugins/${name}/enable`,
      method: "POST",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags Plugin
   * @name PluginDisable
   * @summary Disable a plugin
   * @request POST:/plugins/{name}/disable
   */
  pluginDisable = (
    name: string,
    query?: {
      /** Force disable a plugin even if still in use. */
      force?: boolean;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/plugins/${name}/disable`,
      method: "POST",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags Plugin
   * @name PluginUpgrade
   * @summary Upgrade a plugin
   * @request POST:/plugins/{name}/upgrade
   */
  pluginUpgrade = (
    name: string,
    query: {
      /**
       * Remote reference to upgrade to.
       *
       * The `:latest` tag is optional, and is used as the default if omitted.
       */
      remote: string;
    },
    body: PluginPrivilege[],
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/plugins/${name}/upgrade`,
      method: "POST",
      query: query,
      body: body,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Plugin
   * @name PluginCreate
   * @summary Create a plugin
   * @request POST:/plugins/create
   */
  pluginCreate = (
    query: {
      /**
       * The name of the plugin. The `:latest` tag is optional, and is the
       * default if omitted.
       */
      name: string;
    },
    tarContext: File,
    params: RequestParams = {}
  ) =>
    this.request<void, ErrorResponse>({
      path: `/plugins/create`,
      method: "POST",
      query: query,
      body: tarContext,
      ...params,
    });
  /**
   * No description
   *
   * @tags Plugin
   * @name PluginSet
   * @summary Configure a plugin
   * @request POST:/plugins/{name}/set
   */
  pluginSet = (name: string, body: string[], params: RequestParams = {}) =>
    this.request<void, ErrorResponse>({
      path: `/plugins/${name}/set`,
      method: "POST",
      body: body,
      type: ContentType.Json,
      ...params,
    });
}
