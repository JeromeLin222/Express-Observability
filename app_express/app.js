const express = require('express')
const { register, prometheusMetricsMiddleware, errorMiddleware } = require('./metrics')
const axios = require('axios')
const { logger, logRequest } = require('./logging')


const app = express()
const port = 8000
const FIRST_HOST = process.env.FIRST_HOST || 'app-2'
const SECOND_HOST = process.env.SECOND_HOST || 'app-3'

app.use(prometheusMetricsMiddleware)
app.use(logRequest)



app.get('/', (req, res) => {
    res.json({ message: 'Express app with prometheus metrics.' })

})

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
})


app.get('/simulate-io', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate a 0.5-second delay
    res.send('IO operation completed');
})


app.get('/randomstatus', (req, res) => {
    const statusCodes = [200, 201, 204, 400, 401, 404, 500]
    const randomStatusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)]
    res.sendStatus(randomStatusCode)
})


app.get('/trigger-error', (req, res, next) => {
    const error = new Error('Triggered an error')
    next(error)
})


app.get('/chain', async (req, res, next) => {
    try {
        await axios.get(`http://localhost:8000`)
        await axios.get(`http://${FIRST_HOST}:8000/simulate-io`)
        await axios.get(`http://${SECOND_HOST}:8000/simulate-io`)
        res.sendStatus(200)
    } catch (error) {
        next(error)
    }
})


app.use(errorMiddleware)


app.listen(port, () => {
    logger.info(`express server is running on http://localhost:${port}`)
    // console.log(`express server is running on http://localhost:${port}`)
})
