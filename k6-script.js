import http from 'k6/http'
import { sleep } from 'k6'

export default function () {
    let servers = ["localhost:8000", "localhost:8001","localhost:8002"]
    let endpoints = ['/', '/simulate-io', '/randomstatus', '/trigger-error','/chain']
    servers.forEach((server) => {
        endpoints.forEach((endpoint) => {
            http.get("http://" + server + endpoint)
        })
    })
    sleep(0.5)
}