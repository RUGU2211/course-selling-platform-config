# Monitoring Setup Guide

This guide explains how to set up real-time monitoring with Prometheus and Grafana for the Course Selling Platform.

## Overview

The monitoring stack consists of:
- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and dashboards
- **Spring Boot Actuator** - Metrics endpoints in all services

## Architecture

```
Microservices (Port 8081/metrics)
    ↓
Prometheus (Port 9090) - Scrapes metrics every 15s
    ↓
Grafana (Port 3000) - Visualizes metrics from Prometheus
```

## Prerequisites

1. Kubernetes cluster running
2. All microservices deployed with Actuator enabled
3. Network connectivity between services

## Deployment

### Kubernetes Deployment

The Jenkins pipeline automatically deploys Prometheus and Grafana, or deploy manually:

```bash
# Deploy Prometheus
kubectl apply -f k8s/prometheus.yaml

# Deploy Grafana
kubectl apply -f k8s/grafana.yaml

# Check status
kubectl get pods -n course-plat | grep -E "prometheus|grafana"
```

### Docker Compose Deployment (Local Development)

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Or combine with main services
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

## Access

### Prometheus

**Kubernetes:**
- **URL**: `http://<node-ip>:30090`
- **Port Forward**: `kubectl port-forward -n course-plat svc/prometheus 9090:9090`
- **Access**: `http://localhost:9090`

**Docker Compose:**
- **URL**: `http://localhost:9090`

### Grafana

**Kubernetes:**
- **URL**: `http://<node-ip>:30300`
- **Port Forward**: `kubectl port-forward -n course-plat svc/grafana 3030:3000`
- **Access**: `http://localhost:3030`

**Docker Compose:**
- **URL**: `http://localhost:3030`

**Default Credentials:**
- Username: `admin`
- Password: `admin`

## Configuration

### Prometheus Configuration

Prometheus is configured to scrape metrics from:

1. **Eureka Server** - Service discovery metrics
2. **Config Server** - Configuration metrics
3. **Actuator Service** - Centralized metrics collection
4. **API Gateway** - Gateway metrics
5. **All Microservices** - Application metrics
   - User Service
   - Course Service
   - Enrollment Service
   - Payment Service
   - Notification Service
   - Content Service

### Metrics Endpoints

All Spring Boot services expose metrics at:
- **HTTP Endpoint**: `http://service:8081/actuator/prometheus`
- **Path**: `/actuator/prometheus`

### Grafana Data Source

Grafana is pre-configured with:
- **Data Source**: Prometheus
- **URL**: `http://prometheus:9090` (Kubernetes) or `http://prometheus:9090` (Docker)

## Metrics Available

### Spring Boot Metrics

All services expose standard Spring Boot metrics:
- `jvm_memory_used_bytes` - JVM memory usage
- `jvm_gc_pause_seconds` - GC pause times
- `http_server_requests_seconds` - HTTP request latency
- `http_server_requests_total` - Total HTTP requests
- `process_cpu_usage` - CPU usage
- `system_load_average_1m` - System load

### Custom Metrics

Services can expose custom business metrics via Actuator endpoints.

## Creating Dashboards

### Import Pre-built Dashboards

1. Go to Grafana → **Dashboards** → **Import**
2. Use dashboard IDs from Grafana.com:
   - Spring Boot 2.1 Statistics: `11378`
   - JVM (Micrometer): `4701`
   - Kubernetes Cluster Monitoring: `7249`

### Create Custom Dashboards

1. Go to Grafana → **Dashboards** → **New Dashboard**
2. Add panels with Prometheus queries:
   ```promql
   # CPU Usage
   process_cpu_usage{application="user-service"}
   
   # Memory Usage
   jvm_memory_used_bytes{application="user-service"}
   
   # HTTP Request Rate
   rate(http_server_requests_total{application="user-service"}[5m])
   ```

## Monitoring Services in Jenkins Pipeline

The Jenkins pipeline automatically:
1. Deploys Prometheus and Grafana alongside application services
2. Configures Prometheus to scrape all services
3. Sets up Grafana with Prometheus as data source
4. Waits for monitoring services to be ready

## Troubleshooting

### Prometheus Not Scraping Metrics

```bash
# Check Prometheus targets
kubectl port-forward -n course-plat svc/prometheus 9090:9090
# Open http://localhost:9090/targets

# Check service endpoints
kubectl get endpoints -n course-plat

# Test metrics endpoint manually
kubectl port-forward -n course-plat svc/user-service 8082:8082
curl http://localhost:8082/actuator/prometheus
```

### Grafana Can't Connect to Prometheus

```bash
# Check Prometheus service
kubectl get svc prometheus -n course-plat

# Check Grafana logs
kubectl logs -n course-plat deployment/grafana

# Verify network connectivity
kubectl exec -n course-plat deployment/grafana -- wget -O- http://prometheus:9090/api/v1/status/config
```

### Services Not Exposing Metrics

Ensure services have Actuator enabled and Prometheus endpoint exposed:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: prometheus,health,info,metrics
  endpoint:
    prometheus:
      enabled: true
  metrics:
    export:
      prometheus:
        enabled: true
```

## Best Practices

1. **Retention**: Prometheus is configured with 30-day retention
2. **Storage**: Use persistent volumes for Prometheus and Grafana data
3. **Alerts**: Set up alerting rules in Prometheus for critical metrics
4. **Dashboards**: Create dashboards for each service
5. **Performance**: Monitor Prometheus memory usage and adjust retention if needed

## Advanced Configuration

### Custom Scrape Intervals

Edit `k8s/prometheus.yaml` to adjust scrape intervals:

```yaml
global:
  scrape_interval: 15s  # Change to 30s, 1m, etc.
```

### Resource Limits

Adjust resource limits in Prometheus/Grafana manifests based on cluster capacity.

### High Availability

For production:
- Run Prometheus with 2+ replicas
- Use external storage (e.g., Thanos)
- Set up Grafana with multiple instances behind a load balancer

## Useful Queries

### Service Health
```
up{job="user-service"}
```

### Request Rate
```
rate(http_server_requests_total{application="user-service"}[5m])
```

### Error Rate
```
rate(http_server_requests_total{application="user-service",status=~"5.."}[5m])
```

### Memory Usage
```
jvm_memory_used_bytes{application="user-service",area="heap"}
```

### Response Time (p95)
```
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket{application="user-service"}[5m]))
```

## Support

For issues:
1. Check Prometheus targets page: `/targets`
2. Check Grafana logs
3. Verify services are exposing metrics
4. Check network connectivity between services

