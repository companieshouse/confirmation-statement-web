import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import openTelemetryConfig from "./open-telemetry/openTelemetry.config";
import { ALLOW_ALL_BAGGAGE_KEYS, BaggageSpanProcessor } from "@opentelemetry/baggage-span-processor";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";

let openTelemetry: NodeSDK;

function setupOpenTelemetry(): NodeSDK {
    const traceExporter = new OTLPTraceExporter({
        url: openTelemetryConfig.endpoints.traceExporterUrl,
        headers: {},
    });
    // noinspection SpellCheckingInspection
    return new NodeSDK({
        spanProcessors: [new BaggageSpanProcessor(ALLOW_ALL_BAGGAGE_KEYS), new BatchSpanProcessor(traceExporter)],
        metricReader: new PeriodicExportingMetricReader({
            exporter: new OTLPMetricExporter({
                url: openTelemetryConfig.endpoints.metricsExporterUrl,
                headers: {},
            }),
        }),
        instrumentations: [getNodeAutoInstrumentations()],
    });
}

if (openTelemetryConfig.enabled) {
    console.info(`Starting OpenTelemetry for ${openTelemetryConfig.serviceName}...`);
    try {
        openTelemetry = setupOpenTelemetry();
        openTelemetry.start();
        console.info("OpenTelemetry started successfully.");
    } catch (error) {
        console.error("Failed to start OpenTelemetry:", error);
    }
} else {
    console.info("OpenTelemetry is disabled.");
}

export async function shutdownOpenTelemetry() {
    if (openTelemetry) {
        await openTelemetry
            ?.shutdown()
            .then(() => console.info("OpenTelemetry shutdown complete."))
            .catch(error => console.error("Error during OpenTelemetry shutdown:", error));
    }
}
