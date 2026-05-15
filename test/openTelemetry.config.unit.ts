import * as path from "node:path";

describe("openTelemetryConfig", () => {
  const CONFIG_PATH = path.resolve(__dirname, "../src/open-telemetry/openTelemetry.config.ts");
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns config with enabled=false when OTEL_LOG_ENABLED is not 'true'", () => {
    process.env.OTEL_LOG_ENABLED = "false";
    process.env.OTEL_SERVICE_NAME = "my-service";
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "https://otel-endpoint";
    const config = require(CONFIG_PATH).default;
    expect(config.enabled).toBe(false);
    expect(config.serviceName).toBe("my-service");
    expect(config.endpoints.traceExporterUrl).toBe("https://otel-endpoint/v1/traces");
    expect(config.endpoints.metricsExporterUrl).toBe("https://otel-endpoint/v1/metrics");
  });

  it("returns config with enabled=true when OTEL_LOG_ENABLED is 'true' and endpoint is set", () => {
    process.env.OTEL_LOG_ENABLED = "true";
    process.env.OTEL_SERVICE_NAME = "otel-service";
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4317";
    const config = require(CONFIG_PATH).default;
    expect(config.enabled).toBe(true);
    expect(config.serviceName).toBe("otel-service");
    expect(config.endpoints.traceExporterUrl).toBe("http://localhost:4317/v1/traces");
    expect(config.endpoints.metricsExporterUrl).toBe("http://localhost:4317/v1/metrics");
  });

  it("throws if OTEL_LOG_ENABLED is 'true' but OTEL_EXPORTER_OTLP_ENDPOINT is not set", () => {
    process.env.OTEL_LOG_ENABLED = "true";
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    expect(() => require(CONFIG_PATH)).toThrow("OTEL_EXPORTER_OTLP_ENDPOINT is not set");
  });

  it("uses 'undefined-service' if OTEL_SERVICE_NAME is not set", () => {
    process.env.OTEL_LOG_ENABLED = "true";
    delete process.env.OTEL_SERVICE_NAME;
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "https://otel-endpoint";
    const config = require(CONFIG_PATH).default;
    expect(config.serviceName).toBe("undefined-service");
  });

  it("sets endpoint URLs to 'undefined/v1/traces' and 'undefined/v1/metrics' if endpoint is undefined", () => {
    process.env.OTEL_LOG_ENABLED = "false";
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    const config = require(CONFIG_PATH).default;
    expect(config.endpoints.traceExporterUrl).toBe("undefined/v1/traces");
    expect(config.endpoints.metricsExporterUrl).toBe("undefined/v1/metrics");
  });
});

