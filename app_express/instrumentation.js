const { NodeSDK } = require('@opentelemetry/sdk-node')
// const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node')
const { getNodeAutoInstrumentations, } = require('@opentelemetry/auto-instrumentations-node')
const { PeriodicExportingMetricReader, ConsoleMetricExporter, } = require('@opentelemetry/sdk-metrics')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto')
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto')

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT

const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
        url: `${otlpEndpoint}/v1/traces`,
    }),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            headers: {},
        }),
    }),
    instrumentations: [getNodeAutoInstrumentations()],
})

sdk.start()
