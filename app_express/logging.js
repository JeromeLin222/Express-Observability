const { context, trace } = require('@opentelemetry/api')
const { createLogger, format, level } = require('winston')
const  LokiTransport  = require('winston-loki')

const logger = createLogger({
    level: 'info',
    format: format.json(),
    transports: [
        new LokiTransport({
            host: 'http://loki:3100',
            json: true,
            labels: { app: 'express' },
        }),
    ],
})

function logRequest(req, res, next) {
    const currentSpan = trace.getSpan(context.active())
    res.on('finish', () => {
        const dynamicLabels = {
            method: req.method,
            route: req.path,
            status: res.statusCode.toString(),
            ip: req.ip,
            traceID: currentSpan ? currentSpan.spanContext().traceId : 'unknown',
        }

        const logMessage = {
            message: 'HTTP request',
            labels: dynamicLabels,
            level: 'info',
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