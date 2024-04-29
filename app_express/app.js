const express = require('express')
const promMid = require('express-prometheus-middleware')
const app = express()

const port = 8080

app.use(promMid({
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5],
    requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
    responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400]
}))

app.get('/', (req, res) => {
    console.log('Get express /')
    res.json({message: 'Express app with prometheus metrics.'})
})

app.listen(port, () => {
    console.log(`express server is running on http://localhost:${port}`)
})