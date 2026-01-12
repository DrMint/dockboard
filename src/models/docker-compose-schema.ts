import z from "zod";

/* Based on this spec https://github.com/compose-spec/compose-spec/blob/main/spec.md */

const arrayOrMapSchema = z.union([z.array(z.string()), z.record(z.string(), z.string())]);
const arrayOrStringSchema = z.union([z.array(z.string()), z.string()]);

/**
    Values express a duration as a string in the form of {value}{unit}. The supported units are:
    - us (microseconds)
    - ms (milliseconds)
    - s (seconds)
    - m (minutes)
    - h (hours)
    Values can combine multiple values without separator.
 */
const durationSchema = z.string();

/**
    Values express a byte size as a string in the form of {value}{unit}. The supported units are:
    - b (bytes)
    - k or kb (kilo bytes)
    - m or mb (mega bytes)
    - g or gb (giga bytes)
 */
const byteSizeSchema = z.string();

const systemCapabilitiesSchema = z.enum([
  "ALL",
  "AUDIT_CONTROL",
  "AUDIT_READ",
  "AUDIT_WRITE",
  "BLOCK_SUSPEND",
  "BPF",
  "CHECKPOINT_RESTORE",
  "CHOWN",
  "DAC_OVERRIDE",
  "DAC_READ_SEARCH",
  "FOWNER",
  "FSETID",
  "IPC_LOCK",
  "IPC_OWNER",
  "KILL",
  "LEASE",
  "LINUX_IMMUTABLE",
  "MAC_ADMIN",
  "MAC_OVERRIDE",
  "MKNOD",
  "NET_ADMIN",
  "NET_BIND_SERVICE",
  "NET_BROADCAST",
  "NET_RAW",
  "PERFMON",
  "SETGID",
  "SETFCAP",
  "SETPCAP",
  "SETUID",
  "SYS_ADMIN",
  "SYS_BOOT",
  "SYS_CHROOT",
  "SYS_MODULE",
  "SYS_NICE",
  "SYS_PACCT",
  "SYS_PTRACE",
  "SYS_RAWIO",
  "SYS_RESOURCE",
  "SYS_TIME",
  "SYS_TTY_CONFIG",
  "SYSLOG",
  "WAKE_ALARM",
]);

const serviceAnnotationsSchema = arrayOrMapSchema;

const serviceHealthcheckSchema = z.union([
  z
    .object({
      test: arrayOrStringSchema,
      interval: durationSchema.optional(),
      timeout: durationSchema.optional(),
      retries: z.number().optional(),
      start_period: durationSchema.optional(),
      start_interval: durationSchema.optional(),
    })
    .strict(),
  z.object({ disable: z.boolean() }).strict(),
]);

const serviceBuildSchema = z.union([
  z.string(),
  z
    .object({
      context: z.string(),
      dockerfile: z.string().optional(),
      pull: z.boolean().optional(),
      args: z.union([z.array(z.string()), z.record(z.string(), z.string())]).optional(),
    })
    .strict(),
]);

const serviceLoggingSchema = z
  .object({
    driver: z.string(),
    options: z.object({}).optional(),
  })
  .strict();

const serviceEnvFileShortSyntaxSchema = arrayOrStringSchema;
const serviceEnvFileLongSyntaxSchema = z.array(
  z.object({
    path: z.string(),
    required: z.boolean().optional(),
    format: z.enum(["raw"]).optional(),
  })
);
const serviceEnvFileSchema = z.union([
  serviceEnvFileShortSyntaxSchema,
  serviceEnvFileLongSyntaxSchema,
]);

const serviceDependsOnShortSyntaxSchema = z.array(z.string());
const serviceDependsOnLongSyntaxSchema = z.record(
  z.string(),
  z
    .object({
      restart: z.boolean().optional(),
      condition: z.enum(["service_healthy", "service_started", "service_completed_successfully"]),
      required: z.boolean().optional(),
    })
    .strict()
);
const serviceDependsOnSchema = z.union([
  serviceDependsOnShortSyntaxSchema,
  serviceDependsOnLongSyntaxSchema,
]);

const serviceEnvironmentVariableSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const serviceEnvironmentMapSchema = z.record(z.string(), serviceEnvironmentVariableSchema);
const serviceEnvironmentArraySchema = z.array(serviceEnvironmentVariableSchema);
const serviceEnvironmentSchema = z.union([
  serviceEnvironmentMapSchema,
  serviceEnvironmentArraySchema,
]);

const serviceNetworkPropertiesSchema = z
  .object({
    aliases: z.array(z.string()).optional(),
    interface_name: z.string().optional(),
    ipv4_address: z.string().optional(),
    ipv6_address: z.string().optional(),
    link_local_ips: z.array(z.string()).optional(),
    mac_address: z.string().optional(),
    driver_opts: z.record(z.string(), serviceEnvironmentVariableSchema).optional(),
    gw_priority: z.number().optional(),
    priority: z.number().optional(),
  })
  .strict();

const serviceNetworkSchema = z.union([
  z.array(z.string()),
  z.record(z.string(), serviceNetworkPropertiesSchema),
]);

const servicePortsShortSyntaxSchema = z.array(z.string());
const servicePortsLongSyntaxSchema = z.array(
  z
    .object({
      target: z.number(),
      published: z.number(),
      host_ip: z.string().optional(),
      protocol: z.enum(["tcp", "udp"]).optional(),
      // TODO: app_protocol
      mode: z.enum(["host", "ingress"]).optional(),
      name: z.string().optional(),
    })
    .strict()
);
const servicePortsSchema = z.union([servicePortsShortSyntaxSchema, servicePortsLongSyntaxSchema]);

const serviceSchema = z
  .object({
    annotations: serviceAnnotationsSchema.optional(),
    attach: z.boolean().optional(),
    build: serviceBuildSchema.optional(),
    // TODO: blkio_config
    cpu_count: z.number().optional(),
    cpu_percent: z.number().optional(),
    cpu_shares: z.number().optional(),
    cpu_period: z.number().optional(),
    cpu_quota: z.number().optional(),
    cpu_rt_runtime: z.union([z.number(), durationSchema]).optional(),
    cpu_rt_period: z.union([z.number(), durationSchema]).optional(),
    cpus: z.number().optional(),
    // TODO: cpuset
    cap_add: z.array(systemCapabilitiesSchema).optional(),
    cap_drop: z.array(systemCapabilitiesSchema).optional(),
    cgroup: z.enum(["private", "host"]).optional(),
    cgroup_parent: z.string().optional(),
    command: arrayOrStringSchema.nullable().optional(),
    // TODO: configs
    container_name: z
      .string()
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]+$/)
      .optional(),
    // TODO: credential_spec
    depends_on: serviceDependsOnSchema.optional(),
    // TODO: deploy
    // TODO: develop
    // TODO: device_cgroup_rules
    devices: z.array(z.string()).optional(),
    dns: arrayOrStringSchema.optional(),
    dns_opt: z.array(z.string()).optional(),
    dns_search: arrayOrStringSchema.optional(),
    // TODO: domainname
    entrypoint: arrayOrStringSchema.nullable().optional(),
    env_file: serviceEnvFileSchema.optional(),
    environment: serviceEnvironmentSchema.optional(),
    expose: z.array(z.string()).optional(),
    extends: z
      .object({
        file: z.string().optional(),
        service: z.string().optional(),
      })
      .optional(),
    external_links: z.array(z.string()).optional(),
    extra_hosts: arrayOrMapSchema.optional(),
    gpus: z
      .union([
        z.literal("all"),
        z.array(
          z
            .object({
              driver: z.string(),
              count: z.number(),
            })
            .strict()
        ),
      ])
      .optional(),
    // TODO: group_add
    healthcheck: serviceHealthcheckSchema.optional(),
    hostname: z.string().optional(),
    image: z.string().optional(),
    init: z.boolean().optional(),
    // TODO: ipc
    // TODO: isolation
    labels: arrayOrMapSchema.optional(),
    label_file: arrayOrStringSchema.optional(),
    links: z.array(z.string()).optional(),
    logging: serviceLoggingSchema.optional(),
    // TODO: mac_address
    mem_limit: byteSizeSchema.optional(),
    mem_reservation: byteSizeSchema.optional(),
    mem_swappiness: z.number().min(0).max(100).optional(),
    // TODO: memswap_limit
    // TODO: models
    // TODO: network_mode
    networks: serviceNetworkSchema.optional(),
    oom_kill_disable: z.boolean().optional(),
    oom_score_adj: z.number().min(-1000).max(1000).optional(),
    // TODO: pid
    pids_limit: z.number().min(-1).optional(),
    platform: z.string().optional(),
    ports: servicePortsSchema.optional(),
    // TODO: post_start
    // TODO: pre_stop
    privileged: z.boolean().optional(),
    // TODO: profiles
    // TODO: provider
    // TODO: pull_policy
    read_only: z.boolean().optional(),
    restart: z.enum(["no", "always", "on-failure", "unless-stopped"]).optional(),
    // TODO: runtime
    // TODO: scale
    // TODO: secrets
    security_opt: z.array(z.string()).optional(),
    shm_size: byteSizeSchema.optional(),
    stdin_open: z.boolean().optional(),
    stop_grace_period: durationSchema.optional(),
    // TODO: stop_signal
    // TODO: storage_opt
    // TODO: sysctls
    tmpfs: z.array(z.string()).optional(),
    tty: z.boolean().optional(),
    // TODO: ulimits
    // TODO: use_api_socket
    user: z.string().optional(),
    // TODO: userns_mode
    // TODO: uts
    volumes: z.array(z.string()).optional(),
    volumes_from: z.array(z.string()).optional(),
    working_dir: z.string().optional(),
  })
  .strict();

const networkSchema = z
  .object({
    attachable: z.boolean().optional(),
    driver: z.enum(["bridge", "overlay", "host", "none"]).optional(),
    driver_opts: z.record(z.string(), serviceEnvironmentVariableSchema).optional(),
    enable_ipv4: z.boolean().optional(),
    enable_ipv6: z.boolean().optional(),
    external: z.boolean().optional(),
    // TODO: ipam
    internal: z.boolean().optional(),
    labels: arrayOrMapSchema.optional(),
    name: z.string().optional(),
  })
  .strict();

const volumeSchema = z
  .object({
    driver: z.string().optional(),
    driver_opts: z.record(z.string(), serviceEnvironmentVariableSchema).optional(),
    external: z.boolean().optional(),
    labels: arrayOrMapSchema.optional(),
    name: z.string().optional(),
  })
  .strict()
  .nullable();

export const dockerComposeConfigSchema = z
  // Start by removing all keys that start with "x-" at the top level
  .object({})
  .passthrough()
  .transform((obj) =>
    Object.fromEntries(Object.entries(obj).filter(([key]) => !key.startsWith("x-")))
  )
  .pipe(
    z
      .object({
        name: z.string().optional(),
        services: z.record(z.string(), serviceSchema),
        networks: z.record(z.string(), networkSchema).optional(),
        volumes: z.record(z.string(), volumeSchema).optional(),
      })
      .strict()
  );

export type DockerComposeConfig = z.infer<typeof dockerComposeConfigSchema>;
