const client = require('prom-client')
const { context, trace } = require('@opentelemetry/api')

const register = client.register
client.collectDefaultMetrics({ register })

// Use OpenMetrics content type
register.setContentType(client.Registry.OPENMETRICS_CONTENT_TYPE)

const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    // buckets: [0.1, 0.3, 1.5, 10.5],
    enableExemplars: true,
})

register.registerMetric(httpRequestDuration)

function recordRequest(req, res, durationInSeconds) {
    const currentSpan = trace.getSpan(context.active())
    let metricBody = {
        labels: {
            method: req.method,
            route: req.path,
            status: res.statusCode.toString()
        }
    }
    httpRequestDuration.observe({
        labels: metricBody.labels,
        value: durationInSeconds,
        exemplarLabels: {
            traceId: currentSpan ? currentSpan.spanContext().traceId : 'unknown',
            spanId: currentSpan ? currentSpan.spanContext().spanId : 'unknow'
        }
    })
}

module.exports = { register, recordRequest }