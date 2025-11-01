# Kubernetes Manifests

This directory contains Kubernetes manifests for all services in the Course Selling Platform.

## Structure

Each service has its own manifest file for better organization and management:

### Infrastructure Services
- **`mysql.yaml`** - MySQL database with persistent volume
- **`eureka-server.yaml`** - Service discovery (Eureka)
- **`config-server.yaml`** - Configuration server
- **`api-gateway.yaml`** - API Gateway

### Application Services
- **`actuator.yaml`** - Actuator service for metrics collection
- **`user-service.yaml`** - User management service
- **`course-service.yaml`** - Course management service
- **`enrollment-service.yaml`** - Enrollment service
- **`content-service.yaml`** - Content delivery service
- **`frontend.yaml`** - Frontend React application

### Monitoring Services
- **`prometheus.yaml`** - Prometheus metrics collection and storage
- **`grafana.yaml`** - Grafana visualization dashboards

## Usage

### Deploy All Services

```bash
# Replace placeholders in manifests
export DOCKERHUB_USER=your-username
export IMAGE_TAG=latest

# Process all manifests
for file in k8s/*.yaml; do
  sed "s|DOCKERHUB_USER|${DOCKERHUB_USER}|g; s|IMAGE_TAG|${IMAGE_TAG}|g" "$file" | kubectl apply -f -
done
```

### Deploy Individual Service

```bash
# Example: Deploy user service
sed "s|DOCKERHUB_USER|${DOCKERHUB_USER}|g; s|IMAGE_TAG|${IMAGE_TAG}|g" \
  k8s/user-service.yaml | kubectl apply -f -
```

### Deploy Monitoring Stack

```bash
# Prometheus and Grafana use public images, no replacement needed
kubectl apply -f k8s/prometheus.yaml
kubectl apply -f k8s/grafana.yaml
```

## Service Ports

### Application Services
- **Eureka Server**: 8761 (NodePort: 30761)
- **Config Server**: 8888 (NodePort: 30788)
- **API Gateway**: 8765 (NodePort: 30765)
- **Actuator**: 8081
- **User Service**: 8082
- **Course Service**: 8083
- **Enrollment Service**: 8084
- **Content Service**: 8087

### Monitoring Services
- **Prometheus**: 9090 (NodePort: 30090)
- **Grafana**: 3000 (NodePort: 30300)

## Access Points

### Kubernetes (NodePort)
- **Frontend**: `http://<node-ip>:30000`
- **API Gateway**: `http://<node-ip>:30765`
- **Eureka Dashboard**: `http://<node-ip>:30761`
- **Config Server**: `http://<node-ip>:30788`
- **Prometheus**: `http://<node-ip>:30090`
- **Grafana**: `http://<node-ip>:30300` (admin/admin)

### Port Forward (Development)
```bash
# Prometheus
kubectl port-forward -n course-plat svc/prometheus 9090:9090

# Grafana
kubectl port-forward -n course-plat svc/grafana 3030:3000

# Eureka Dashboard
kubectl port-forward -n course-plat svc/eureka-server 8761:8761
```

## Monitoring

### Prometheus Metrics
All Spring Boot services expose metrics on port 8081 at `/actuator/prometheus`.

Prometheus scrapes metrics from:
- All microservices
- Eureka Server
- Config Server
- API Gateway
- Actuator Service

### Grafana Dashboards
Grafana is pre-configured with Prometheus as the data source.

**Default Credentials:**
- Username: `admin`
- Password: `admin`

## Configuration

### Environment Variables
Each service has its own ConfigMap with service-specific configuration:
- `eureka-config` - Eureka Server config
- `config-server-config` - Config Server config
- `actuator-config` - Actuator config
- `api-gateway-config` - API Gateway config
- `user-service-config` - User service config
- `course-service-config` - Course service config
- `enrollment-service-config` - Enrollment service config
- `content-service-config` - Content service config

### Secrets
- **`dockerhub-secret`** - Docker Hub credentials for pulling images
  - Created automatically by Jenkins pipeline

## Dependencies

### Service Startup Order
1. **MySQL** - Database (must be ready first)
2. **Eureka Server** - Service discovery
3. **Config Server** - Configuration service
4. **Actuator** - Metrics service
5. **Microservices** - User, Course, Enrollment, Content
6. **API Gateway** - Routes requests to services
7. **Monitoring** - Prometheus and Grafana (can start independently)

### Health Checks
All services have:
- **Liveness Probe** - Restarts unhealthy containers
- **Readiness Probe** - Prevents traffic to unready pods

## Persistent Volumes

- **MySQL**: `mysql-pvc` (10Gi)
- **Prometheus**: `prometheus-pvc` (20Gi)
- **Grafana**: `grafana-pvc` (10Gi)

## Resource Limits

### Infrastructure Services
- **Eureka/Config Server**: 256Mi-512Mi RAM, 100m-500m CPU
- **MySQL**: 512Mi-1Gi RAM, 250m-500m CPU

### Application Services
- **Microservices**: 512Mi-1Gi RAM, 200m-1000m CPU
- **API Gateway**: 256Mi-512Mi RAM, 100m-500m CPU
- **Actuator**: 128Mi-256Mi RAM, 100m-300m CPU

### Monitoring Services
- **Prometheus**: 512Mi-2Gi RAM, 250m-1000m CPU
- **Grafana**: 256Mi-512Mi RAM, 100m-500m CPU

## Troubleshooting

### Check Service Status
```bash
kubectl get pods -n course-plat
kubectl get services -n course-plat
kubectl get deployments -n course-plat
```

### View Service Logs
```bash
kubectl logs -n course-plat deployment/<service-name>
kubectl logs -n course-plat -l app=<service-name>
```

### Check Service Health
```bash
# Port forward to service
kubectl port-forward -n course-plat svc/<service-name> <local-port>:<service-port>

# Check health endpoint
curl http://localhost:<local-port>/actuator/health
```

### Debug Deployment Issues
```bash
kubectl describe deployment <service-name> -n course-plat
kubectl describe pod <pod-name> -n course-plat
kubectl get events -n course-plat --sort-by='.lastTimestamp'
```

## Notes

- All services are deployed in the `course-plat` namespace
- Image placeholders (`DOCKERHUB_USER` and `IMAGE_TAG`) must be replaced before applying
- Monitoring services use public Docker images (no custom build needed)
- Services use ConfigMaps for configuration (sensitive data should use Secrets)

