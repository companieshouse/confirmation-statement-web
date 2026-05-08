jest.mock("@opentelemetry/sdk-node", () => {
  const start = jest.fn().mockResolvedValue(undefined);
  const shutdown = jest.fn().mockResolvedValue(undefined);
  const NodeSDK = jest.fn().mockImplementation(() => ({ start, shutdown }));
  return { NodeSDK, __esModule: true, _mocks: { start, shutdown, NodeSDK } };
});

describe("OpenTelemetry setup and shutdown", () => {
  let consoleInfoSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    process.env.OTEL_LOG_ENABLED = "true";
    process.env.OTEL_SERVICE_NAME = "test-service";
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
    consoleInfoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.OTEL_LOG_ENABLED;
    delete process.env.OTEL_SERVICE_NAME;
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  });

  it("starts OpenTelemetry when enabled", async () => {
    require("../../src/openTelemetry");
    const sdkMocks = (require("@opentelemetry/sdk-node")._mocks);
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining("Starting OpenTelemetry for test-service...")
    );
    expect(sdkMocks.start).toHaveBeenCalled();
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining("OpenTelemetry started successfully.")
    );
  });

  it("logs error if OpenTelemetry fails to start", async () => {
    const sdkMocks = (require("@opentelemetry/sdk-node")._mocks);
    sdkMocks.start.mockImplementationOnce(() => { throw new Error("fail"); });
    require("../../src/openTelemetry");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to start OpenTelemetry:"),
      expect.any(Error)
    );
  });

  it("logs when OpenTelemetry is disabled", async () => {
    process.env.OTEL_LOG_ENABLED = "false";
    require("../../src/openTelemetry");
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining("OpenTelemetry is disabled.")
    );
  });

  it("shuts down OpenTelemetry if started", async () => {
    const { shutdownOpenTelemetry } = require("../../src/openTelemetry");
    const sdkMocks = (require("@opentelemetry/sdk-node")._mocks);
    (global as any).openTelemetry = new (require("@opentelemetry/sdk-node").NodeSDK)({} as any);
    await shutdownOpenTelemetry();
    expect(sdkMocks.shutdown).toHaveBeenCalled();
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining("OpenTelemetry shutdown complete.")
    );
  });

  it("logs error if shutdown fails", async () => {
    const sdkMocks = (require("@opentelemetry/sdk-node")._mocks);
    sdkMocks.shutdown.mockRejectedValueOnce(new Error("shutdown error"));
    const { shutdownOpenTelemetry } = require("../../src/openTelemetry");
    (global as any).openTelemetry = new (require("@opentelemetry/sdk-node").NodeSDK)({} as any);
    await shutdownOpenTelemetry();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error during OpenTelemetry shutdown:"),
      expect.any(Error)
    );
  });
});
