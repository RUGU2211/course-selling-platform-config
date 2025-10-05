# Frontend Deployment Guide

This document provides comprehensive instructions for deploying the Course Selling Platform frontend application in various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Kubernetes cluster (local or cloud)
- kubectl configured for your cluster

## Local Development

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8765/api
VITE_APP_NAME=Course Selling Platform
VITE_APP_VERSION=1.0.0
```

## Docker Deployment

### Building the Image

```bash
# Build the Docker image
docker build -t course-platform/frontend:latest .

# Build with specific tag
docker build -t course-platform/frontend:v1.0.0 .
```

### Running with Docker

```bash
# Run the container
docker run -d \
  --name frontend \
  -p 80:80 \
  -e API_URL=http://localhost:8765/api \
  -e APP_NAME="Course Selling Platform" \
  -e APP_VERSION=1.0.0 \
  course-platform/frontend:latest
```

### Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - API_URL=http://api-gateway:8765/api
      - APP_NAME=Course Selling Platform
      - APP_VERSION=1.0.0
    depends_on:
      - api-gateway
    networks:
      - course-platform

networks:
  course-platform:
    external: true
```

Run with:
```bash
docker-compose up -d
```

## Kubernetes Deployment

### Prerequisites

Ensure you have:
- Kubernetes cluster running
- kubectl configured
- Namespace created: `kubectl create namespace course-platform`

### Deploy to Kubernetes

```bash
# Apply the frontend deployment
kubectl apply -f ../k8s/frontend-deployment.yaml

# Check deployment status
kubectl get pods -n course-platform -l app=frontend

# Check service
kubectl get svc -n course-platform frontend

# Check ingress
kubectl get ingress -n course-platform frontend-ingress
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment frontend --replicas=5 -n course-platform

# Auto-scaling is configured via HPA in the deployment file
kubectl get hpa -n course-platform frontend-hpa
```

### Rolling Updates

```bash
# Update the image
kubectl set image deployment/frontend frontend=course-platform/frontend:v1.1.0 -n course-platform

# Check rollout status
kubectl rollout status deployment/frontend -n course-platform

# Rollback if needed
kubectl rollout undo deployment/frontend -n course-platform
```

## Cloud Deployment

### AWS EKS

1. **Setup EKS Cluster**
```bash
# Create EKS cluster
eksctl create cluster --name course-platform --region us-west-2

# Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name course-platform
```

2. **Deploy Application**
```bash
# Create namespace
kubectl create namespace course-platform

# Apply all configurations
kubectl apply -f ../k8s/
```

3. **Setup Load Balancer**
```bash
# Install AWS Load Balancer Controller
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"

# Update ingress for ALB
kubectl annotate ingress frontend-ingress -n course-platform \
  kubernetes.io/ingress.class=alb \
  alb.ingress.kubernetes.io/scheme=internet-facing \
  alb.ingress.kubernetes.io/target-type=ip
```

### Google GKE

1. **Setup GKE Cluster**
```bash
# Create cluster
gcloud container clusters create course-platform \
  --zone us-central1-a \
  --num-nodes 3

# Get credentials
gcloud container clusters get-credentials course-platform --zone us-central1-a
```

2. **Deploy Application**
```bash
kubectl create namespace course-platform
kubectl apply -f ../k8s/
```

### Azure AKS

1. **Setup AKS Cluster**
```bash
# Create resource group
az group create --name course-platform-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group course-platform-rg \
  --name course-platform \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group course-platform-rg --name course-platform
```

## Environment Configuration

### Runtime Configuration

The application supports runtime environment configuration through:

1. **Environment Variables**
   - `API_URL`: Backend API endpoint
   - `APP_NAME`: Application name
   - `APP_VERSION`: Application version

2. **ConfigMap (Kubernetes)**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
data:
  API_URL: "https://api.course-platform.com/api"
  APP_NAME: "Course Selling Platform"
  APP_VERSION: "1.0.0"
```

3. **Runtime Configuration File**
The Docker entrypoint creates a `config.js` file that's loaded by the application:
```javascript
window.ENV = {
  API_URL: "https://api.course-platform.com/api",
  APP_NAME: "Course Selling Platform",
  APP_VERSION: "1.0.0"
};
```

### Security Configuration

1. **Content Security Policy**
Configure CSP headers in nginx.conf:
```nginx
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
```

2. **HTTPS Configuration**
For production, ensure HTTPS is enabled:
```yaml
# In ingress.yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - course-platform.com
    secretName: frontend-tls
```

## Monitoring and Troubleshooting

### Health Checks

The application provides a health endpoint at `/health`:

```bash
# Check health
curl http://localhost/health

# In Kubernetes
kubectl exec -it <pod-name> -n course-platform -- curl localhost/health
```

### Logging

1. **Application Logs**
```bash
# Docker
docker logs frontend

# Kubernetes
kubectl logs -f deployment/frontend -n course-platform
```

2. **Nginx Logs**
```bash
# Access logs
kubectl exec -it <pod-name> -n course-platform -- tail -f /var/log/nginx/access.log

# Error logs
kubectl exec -it <pod-name> -n course-platform -- tail -f /var/log/nginx/error.log
```

### Common Issues

1. **API Connection Issues**
   - Check `API_URL` environment variable
   - Verify backend services are running
   - Check network connectivity

2. **Static Assets Not Loading**
   - Verify nginx configuration
   - Check file permissions
   - Ensure proper MIME types

3. **Routing Issues**
   - Verify nginx `try_files` configuration
   - Check React Router setup
   - Ensure all routes fall back to `index.html`

### Performance Monitoring

1. **Resource Usage**
```bash
# Check resource usage
kubectl top pods -n course-platform -l app=frontend

# Check HPA status
kubectl describe hpa frontend-hpa -n course-platform
```

2. **Application Metrics**
- Monitor response times
- Track error rates
- Monitor bundle size and load times

### Backup and Recovery

1. **Configuration Backup**
```bash
# Backup Kubernetes configurations
kubectl get all -n course-platform -o yaml > frontend-backup.yaml
```

2. **Disaster Recovery**
```bash
# Restore from backup
kubectl apply -f frontend-backup.yaml
```

## Production Checklist

- [ ] Environment variables configured
- [ ] HTTPS enabled with valid certificates
- [ ] Security headers configured
- [ ] Resource limits set
- [ ] Health checks configured
- [ ] Monitoring and alerting setup
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security scanning performed
- [ ] Documentation updated

## Support

For deployment issues:
1. Check the logs first
2. Verify configuration
3. Test connectivity
4. Review resource usage
5. Consult this documentation

For additional help, contact the development team or create an issue in the project repository.