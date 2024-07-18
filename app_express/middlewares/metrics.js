const client = require('prom-client')
const { context, trace } = require('@opentelemetry/api')

const register = client.register
const appName =  process.env.APP_NAME || "Express_app"


client.collectDefaultMetrics({ register })

// Use OpenMetrics content type
register.setContentType(client.Registry.OPENMETRICS_CONTENT_TYPE)

const httpRequestDuration = new client.Histogram({
    name: 'http_request_times',
    help: 'HTTP requests time in seconds',
    labelNames: ['method', 'route', 'app_name'],
    enableExemplars: true,
})

const httpRequest = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', "app_name"],
})

const httpResponse = new client.Counter({
    name: 'http_responses_total',
    help: 'Total number of HTTP responses',
    labelNames: ['method', 'route', 'status', 'app_name'],
})

const requestInProcess = new client.Gauge({
    name: 'http_requests_in_process',
    help: 'Number of requests in process',
    labelNames: ['method', 'route', 'app_name']
})

const exception = new client.Counter({
    name: 'express_exception',
    help: 'Total number of exceptions in express',
    labelNames: ['method', 'route', 'exceptionType' , 'app_name']
})

register.registerMetric(httpRequestDuration)
register.registerMetric(httpRequest)
register.registerMetric(httpResponse)
register.registerMetric(requestInProcess)
register.registerMetric(exception)


function recordRequest(req, res, durationInSeconds) {
    const currentSpan = trace.getSpan(context.active())
    let metricBody = {
        labels: {
            method: req.method,
            route: req.path,
            app_name: appName
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
    httpRequest.inc(metricBody.labels)
}


function recordResponse (req, res) {
    let metricBody = {
        labels: {
            method: req.method,
            route: req.path,
            status: res.statusCode.toString(),
            app_name: appName,
        }
    }
    httpResponse.inc(metricBody.labels)
}

function prometheusMetricsMiddleware(req, res, next) {

    const method = req.method
    const route = req.path
    const labels = { method, route, app_name: appName }
    requestInProcess.inc(labels)

    const start = process.hrtime()
    res.on('finish', () => {
        const durationInMilliseconds = process.hrtime(start)
        const durationInSeconds = durationInMilliseconds[0] + durationInMilliseconds[1] / 1e9
        recordRequest(req, res, durationInSeconds)
        recordResponse(req, res)
        requestInProcess.dec(labels)
    })
    next()
}

function errorMiddleware(err, req, res, next) {
    const currentSpan = trace.getSpan(context.active())
    const traceId = currentSpan ? currentSpan.spanContext().traceId : 'unknown'
    const spanId = currentSpan ? currentSpan.spanContext().spanId : 'unknown'
    const method = req.method
    const route = req.path
    const exceptionType = err.constructor.name
    const labels = { method, route, exceptionType, app_name: appName}
    exception.inc(labels)
    err.message = `${err.message}, "trace_id":"${traceId}", "span_id":"${spanId}",`

    next(err)
}



module.exports = { register, prometheusMetricsMiddleware, errorMiddleware }