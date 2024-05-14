const express = require('express')
const { register, recordRequest } = require('./metrics')
const { propagation, context, diag, trace } = require('@opentelemetry/api')
const axios = require('axios')
const { logger, logRequest } = require('./logging')


const app = express()

const port = 8000

app.use((req, res, next) => {
    const start = process.hrtime()
    res.on('finish', () => {
        const durationINMilliseconds = process.hrtime(start)
        const durationInSeconds = durationINMilliseconds[0] + durationINMilliseconds[1] / 1e9
        recordRequest(req, res, durationInSeconds)
    })
    next()
})

app.use(logRequest)



app.get('/', (req, res) => {
    console.log('Get express/')
    res.json({ message: 'Express app with prometheus metrics.' })

})

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
})

// app.get('/metrics', async (req, res) => {
//     const ctx = propagation.extract(context.active(), req.headers)
//     const newCtx = trace.setSpan(context.active(), undefined)
//     await context.with(newCtx, async () => {
//         res.set('Content-Type', register.contentType)
//         res.end(await register.metrics())
//     })
// })

app.get('/simulate-io', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate a 5-second delay
    res.send('IO operation completed');
});

app.get('/randomstatus', (req, res) => {
    const statusCodes = [200, 201, 204, 400, 401, 404, 500]
    const randomStatusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)]
    res.sendStatus(randomStatusCode)
})



// Call the function to start sending random requests
// setInterval(sendRandomRequests, 5000) // Send a request every 5 seconds

app.listen(port, () => {
    logger.info(`express server is running on http://localhost:${port}`)
    console.log(`express server is running on http://localhost:${port}`)
})
