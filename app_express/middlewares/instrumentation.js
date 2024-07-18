const { NodeSDK } = require('@opentelemetry/sdk-node')
const { getNodeAutoInstrumentations, } = require('@opentelemetry/auto-instrumentations-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto')
const { Resource } = require('@opentelemetry/resources')


const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
const appName =  process.env.APP_NAME || "Express_app"


// can use environment variables to set the service name
const customResource = new Resource({
    'compose_service': appName,
    'service.name': appName,
})

const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
        url: `${otlpEndpoint}/v1/traces`,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
    resource: customResource,
})
sdk.start()