# Monitoring Setup Guide

This document describes the monitoring infrastructure for the Course Selling Platform using Prometheus and Grafana.

## Architecture

```
┌─────────────────────┐
│   All Microservices │
│  (expose /actuator/ │
│   prometheus)       │
└──────────┬──────────┘
           │ Scrapes metrics
           ▼
┌─────────────────────┐
│     Prometheus      │
│  (Port 9090)        │
└──────────┬──────────┘
           │ Queries data
           ▼
┌─────────────────────┐
│      Grafana        │
│  (Port 3030)        │
└─────────────────────┘
```

## Services

### Prometheus
- **URL:** http://localhost:9090
- **Purpose:** Metrics collection and storage
- **Configuration:** `monitoring/prometheus.yml`
- **Retention:** 30 days

### Grafana
- **URL:** http://localhost:3030
- **Credentials:** admin/admin
- **Purpose:** Visualization and dashboards
- **Pre-configured Dashboard:** Course Platform - Microservices Dashboard

## Enabled Metrics

All Spring Boot services expose the following metrics:
- **JVM Metrics:** Memory usage, CPU usage, thread counts
- **HTTP Metrics:** Request rates, response times, error rates
- **Application Metrics:** Database connections, cache stats
- **Eureka Metrics:** Service registration counts

## Starting Monitoring

### Option 1: With all services
```bash
docker-compose up -d
```

### Option 2: Monitoring only
```bash
# Start monitoring services
docker-compose up -d prometheus grafana

# Or use separate compose file
docker-compose -f docker-compose.monitoring.yml up -d
```

### Option 3: From scratch
```bash
# 1. Build and start all services
docker-compose up -d

# 2. Verify services are running
docker-compose ps

# 3. Check Prometheus targets
open http://localhost:9090/targets

# 4. Open Grafana dashboard
open http://localhost:3030
```

## Access Points

- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:8765
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3030
- **Eureka Dashboard:** http://localhost:8761

## Prometheus Targets

All targets are configured in `monitoring/prometheus.yml`:
- `eureka-server` - Service discovery metrics
- `config-server` - Configuration server metrics
- `api-gateway` - Gateway routing metrics
- `user-service` - User management metrics
- `course-service` - Course management metrics
- `enrollment-service` - Enrollment metrics
- `content-service` - Content delivery metrics

## Grafana Dashboard

The pre-configured dashboard includes:

1. **Service Health Overview** - UP/DOWN status for all services
2. **API Gateway - Request Rate** - Requests per second
3. **API Gateway - Response Time** - P95/P99 latencies
4. **JVM Memory Usage** - Heap memory consumption
5. **HTTP Request Rate** - By service and status code
6. **Error Rate** - 5xx errors per service
7. **Database Connection Pool** - Active/idle connections
8. **Eureka Registrations** - Service discovery metrics
9. **CPU Usage** - By service
10. **Thread Count** - JVM thread metrics

## Adding Prometheus Support

To add Prometheus metrics to a new service:

1. Add dependency to `pom.xml`:
```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

2. Enable Prometheus endpoint in `application.yml`:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: prometheus,health,info,metrics
```

3. Add scrape target to `monitoring/prometheus.yml`:
```yaml
- job_name: 'your-service'
  static_configs:
    - targets: ['your-service:8080']
  metrics_path: /actuator/prometheus
```

4. Rebuild and restart:
```bash
docker-compose up -d --build your-service
```

## Troubleshooting

### Prometheus targets showing DOWN

1. Check service is running:
```bash
docker-compose ps
```

2. Check endpoint exists:
```bash
curl http://localhost:<port>/actuator/prometheus
```

3. Check Prometheus logs:
```bash
docker-compose logs prometheus
```

### Grafana not showing data

1. Verify Prometheus datasource:
   - Go to Configuration → Data Sources
   - Check Prometheus URL is `http://prometheus:9090`

2. Check dashboard queries:
   - Open dashboard
   - Click panel → Edit
   - Verify metric names are correct

### No metrics endpoints

Ensure Micrometer Prometheus dependency is added and services are rebuilt:
```bash
# Rebuild all services
docker-compose up -d --build

# Check individual service
docker-compose logs <service-name>
```

## Useful Prometheus Queries

```promql
# Request rate
rate(spring_cloud_gateway_requests_seconds_count[5m])

# Error rate
rate(http_server_requests_seconds_count{status=~"5.."}[5m])

# Memory usage percent
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} * 100

# Average response time
rate(http_server_requests_seconds_sum[5m]) / rate(http_server_requests_seconds_count[5m])
```

## Production Considerations

For production deployment:

1. **Persistent Storage:** Already configured with Docker volumes
2. **Authentication:** Configure Grafana authentication
3. **Alerts:** Set up Prometheus AlertManager
4. **Retention:** Adjust `--storage.tsdb.retention.time` in Prometheus
5. **Resource Limits:** Add CPU/memory limits to containers

## Next Steps

1. Rebuild all services with Micrometer Prometheus:
```bash
docker-compose down
docker-compose up -d --build
```

2. Wait for all services to start:
```bash
docker-compose ps
```

3. Verify Prometheus is scraping:
```bash
# Check targets
curl http://localhost:9090/api/v1/targets | jq

# Check service registry
curl http://localhost:8761
```

4. Open Grafana dashboard:
```bash
open http://localhost:3030
# Login: admin/admin
```

## Documentation

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Micrometer Documentation](https://micrometer.io/)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
