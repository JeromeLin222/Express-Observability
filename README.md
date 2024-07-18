# Express Observability with Grafana
![Express-Observability](https://github.com/user-attachments/assets/c51c0f44-6c78-4e70-bbff-b1317adb5524)

## Introduction

The Express Observability App is built using Node.js and Express.js to provide a robust backend service with comprehensive observability features, including OpenTelemetry, Prometheus, Grafana Loki, Grafana Tempo, and Grafana for visualization.

## Features

- OpenTelemetry: Automatically instruments the application for tracing.
- Prometheus: Collects application metrics, available at /metrics.
- Grafana Loki: Aggregates application logs.
- Grafana Tempo: Stores and queries trace data.
- Grafana: Visualizes metrics, logs, and traces.
- Docker Compose: Manages all observability stack components.

## Quick Start

### Prerequisites

- Docker and Docker Compose

### Steps

1. **Install Loki Docker Driver**:
    ```bash
    docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions
    ```

2. **Start services with Docker Compose**:
    ```bash
    docker-compose up
    ```

3. **Install k6**:
    Follow the instructions [here](https://k6.io/docs/getting-started/installation/).

4. **Send requests to Express app**:
    ```bash
    k6 run --vus 1 --duration 300s k6-script.js
    ```

5. **Check Grafana dashboard**:
    Visit [http://localhost:3000](http://localhost:3000) with `admin:admin`.
![截圖 2024-07-18 下午6 04 40](https://github.com/user-attachments/assets/773bbc3a-2a3f-40c7-b962-726adb1fee99)

   You can view a comprehensive overview of the application's metrics, logs, and traces in the Grafana dashboard. The pre-configured dashboard provides insights into total requests, request counts per endpoint, average request durations, and more.


   

