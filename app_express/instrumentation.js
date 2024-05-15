const { NodeSDK } = require('@opentelemetry/sdk-node')
const { getNodeAutoInstrumentations, } = require('@opentelemetry/auto-instrumentations-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto')
const { Resource } = require('@opentelemetry/resources')



const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
console.log('otlpEndpoint: ', otlpEndpoint)

const customResource = new Resource({
    'compose_service': 'app_express',
    'service.name': 'app_express',
})

const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
        url: `${otlpEndpoint}/v1/traces`,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
    resource: customResource,
})
sdk.start()