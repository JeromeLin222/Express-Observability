const { context, trace } = require('@opentelemetry/api')
const { createLogger, format, level, transports } = require('winston')
const myFormat = format.printf(({ level, message, trace_id, span_id, method, path, httpVersion, status }) => {
    return `${level}: ${message}, "trace_id":"${trace_id}", "span_id":"${span_id}", "${method} ${path} HTTP/${httpVersion} ${status}"`
})
const logger = createLogger({
    level: 'info',
    defaultMeta: { service: 'express' },
    format: format.combine(
        format.json(),
        myFormat
    ),
    transports: [new transports.Console()],
})

function logRequest(req, res, next) {
    const currentSpan = trace.getSpan(context.active())
    res.on('finish', () => {

        const logMessage = {
            level: 'info',
            message: 'http request',
            trace_id: currentSpan ? currentSpan.spanContext().traceId : 'unknown',
            span_id: currentSpan ? currentSpan.spanContext().spanId : 'unknown',
            method: req.method,
            path: req.path,
            httpVersion: req.httpVersion,
            status: res.statusCode,
        }
        if (res.statusCode >= 500) {
            logMessage.message = 'Server error'
            logMessage.level = 'error'
        } else if (res.statusCode >= 400) {
            logMessage.message = 'Client error'
            logMessage.level = 'warn'
        }

        logger.log(logMessage)
    })
    next()
}

module.exports = { logger, logRequest }