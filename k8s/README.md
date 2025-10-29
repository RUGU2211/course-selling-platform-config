# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the Course Selling Platform.

## Prerequisites

- Kubernetes cluster (minikube, kind, or cloud-based)
- kubectl configured
- Docker images built and pushed to registry (or use local images)
- NGINX Ingress Controller (for ingress)

## Directory Structure

```
k8s/
├── 00-namespace.yaml              # Namespace definition
├── 10-mysql-configmap.yaml        # MySQL initialization script
├── 11-mysql-deployment.yaml       # MySQL database
├── 20-eureka-config.yaml          # Eureka and Config Server
├── 30-services.yaml               # Microservices (all)
├── 40-gateway.yaml                # API Gateway
├── 50-frontend.yaml               # Frontend web app
├── 60-ingress.yaml                # Ingress configuration
└── 12-frontend-nginx-configmap.yaml # Frontend nginx config
```

## Deployment Order

Deploy in this order for proper dependencies:

```bash
# 1. Create namespace
kubectl apply -f 00-namespace.yaml

# 2. Deploy infrastructure
kubectl apply -f 10-mysql-configmap.yaml
kubectl apply -f 11-mysql-deployment.yaml
kubectl apply -f 12-frontend-nginx-configmap.yaml

# 3. Deploy service discovery and config
kubectl apply -f 20-eureka-config.yaml

# 4. Deploy microservices
kubectl apply -f 30-services.yaml

# 5. Deploy API Gateway
kubectl apply -f 40-gateway.yaml

# 6. Deploy frontend
kubectl apply -f 50-frontend.yaml

# 7. Deploy ingress
kubectl apply -f 60-ingress.yaml
```

## Quick Deploy (All at Once)

```bash
kubectl apply -f .
```

## Service Endpoints

After deployment, services are accessible via:

- **Frontend**: http://localhost:30080 (NodePort) or via ingress
- **API Gateway**: http://localhost:30765 (NodePort)
- **Eureka Dashboard**: http://eureka-server:8761 or via ingress
- **Config Server**: http://config-server:8888 or via ingress

### Ingress Hosts

If using ingress with host-based routing:

- Frontend: http://frontend.local
- API: http://api.local
- Eureka: http://eureka.local
- Config: http://config.local

Note: Add these to `/etc/hosts` for local development:
```
127.0.0.1 frontend.local
127.0.0.1 api.local
127.0.0.1 eureka.local
127.0.0.1 config.local
```

## Service Architecture

### Infrastructure Services
- **MySQL** (Port 3306): Database with multiple DBs
- **Eureka** (Port 8761): Service discovery
- **Config Server** (Port 8888): Centralized configuration

### Business Services
- **User Service** (Port 8082)
- **Course Service** (Port 8083)
- **Enrollment Service** (Port 8084)
- **Notification Service** (Port 8085)
- **Payment Service** (Port 8086)
- **Content Service** (Port 8087)

### Edge Services
- **API Gateway** (Port 8765): Routes all API requests
- **Frontend** (Port 80): React web application

## Environment Variables

### Common Variables
All services use:
- `SPRING_PROFILES_ACTIVE=docker`
- `EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://eureka-server:8761/eureka/`
- `SPRING_CONFIG_IMPORT=optional:configserver:http://config-server:8888`

### Database Connection
```
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/{database}
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root
```

## Scaling Services

To scale a service:

```bash
kubectl scale deployment user-service --replicas=3 -n course-platform
```

## Checking Status

```bash
# Check all pods
kubectl get pods -n course-platform

# Check services
kubectl get svc -n course-platform

# Check logs
kubectl logs -f deployment/user-service -n course-platform

# Describe pod for troubleshooting
kubectl describe pod <pod-name> -n course-platform
```

## Troubleshooting

### Services Not Starting

1. Check if MySQL is ready:
```bash
kubectl get pods -n course-platform | grep mysql
kubectl logs mysql-xxxxx -n course-platform
```

2. Check service logs:
```bash
kubectl logs -f deployment/user-service -n course-platform
```

3. Check pod status:
```bash
kubectl describe pod <pod-name> -n course-platform
```

### Port Already in Use

If NodePort 30080 or 30765 is already in use, edit the service files:
- `50-frontend.yaml` - Change nodePort
- `40-gateway.yaml` - Change nodePort

### DNS Issues

For ingress to work properly:
1. Install NGINX Ingress Controller:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

2. Update /etc/hosts for local development

## Cleanup

To remove all resources:

```bash
kubectl delete -f .
# Or
kubectl delete namespace course-platform
```

## Customization

### Change Image Tags

Edit the image fields in deployment files:
```yaml
image: course-selling-platf-user-service:latest
# Change to:
image: your-registry/user-service:v1.0.0
```

### Change Resource Limits

Add resources to container specs:
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### Configure Persistent Storage

MySQL uses a PersistentVolumeClaim. Adjust storage in `11-mysql-deployment.yaml`:
```yaml
resources:
  requests:
    storage: 5Gi  # Change from 1Gi
```

## Production Considerations

For production deployment:

1. **Secrets Management**: Use Kubernetes Secrets for:
   - Database passwords
   - Razorpay keys
   - JWT secrets

2. **Resource Limits**: Set appropriate CPU/memory limits

3. **Replica Sets**: Run multiple replicas for high availability

4. **Monitoring**: Integrate with monitoring tools (Prometheus, Grafana)

5. **External Database**: Use managed database services

6. **Ingress TLS**: Configure TLS certificates

7. **Image Registry**: Use private container registry

8. **Backup**: Set up database backup strategy

## Support

For issues or questions, check the logs:
```bash
kubectl logs -f deployment/<service-name> -n course-platform
```
