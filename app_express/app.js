const express = require('express')
// const promMid = require('express-prometheus-middleware')
const { register, recordRequest } = require('./metrics')
const app = express()

const port = 8000

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

app.use((req, res, next) => {
    const start = process.hrtime()
    res.on('finish', () => {
        const durationINMilliseconds = process.hrtime(start)
        const durationInSeconds = durationINMilliseconds[0] + durationINMilliseconds[1] / 1e9
        recordRequest(req, res, durationInSeconds)
    })
    next()
})

// app.use(promMid({
//     metricsPath: '/metrics',
//     collectDefaultMetrics: true,
//     requestDurationBuckets: [0.1, 0.5, 1, 1.5],
//     requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
//     responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400]
// }))

app.get('/', (req, res) => {
    console.log('Get express /')
    res.json({message: 'Express app with prometheus metrics.'})
})

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
})


app.get('/rolldice', (req, res) => {
    res.send(getRandomNumber(1, 6).toString());
  });

app.listen(port, () => {
    console.log(`express server is running on http://localhost:${port}`)
})