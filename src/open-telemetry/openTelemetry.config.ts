// noinspection SpellCheckingInspection

interface OpenTelemetryConfiguration {
  serviceName: string;
  enabled: boolean;
  endpoints: {
    traceExporterUrl: string | undefined
    metricsExporterUrl: string | undefined
  };
}

const env : NodeJS.ProcessEnv = process.env
const openTelemetryEnabled = env.OTEL_LOG_ENABLED === "true"
const otlpEndpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT

if (openTelemetryEnabled  && !otlpEndpoint) {
  throw new Error("OTEL_EXPORTER_OTLP_ENDPOINT is not set")
}

const openTelemetryConfig: OpenTelemetryConfiguration = {
  serviceName: env.OTEL_SERVICE_NAME ?? "undefined-service",
  enabled : openTelemetryEnabled,
  endpoints: {
    traceExporterUrl: `${otlpEndpoint}/v1/traces`,
    metricsExporterUrl: `${otlpEndpoint}/v1/metrics`,
  }
}

export default openTelemetryConfig
