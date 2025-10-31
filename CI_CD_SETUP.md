# CI/CD Pipeline Setup Guide

This guide explains how to set up the automated CI/CD pipeline for the Course Selling Platform.

## Pipeline Overview

The pipeline automatically:
1. **Triggers on push** to the repository
2. **Builds & Tests** all microservices using Maven
3. **Creates Docker images** for all services
4. **Pushes images** to Docker Hub
5. **Pulls images and creates containers** using Docker Compose
6. **Deploys to Kubernetes** automatically

## Prerequisites

### 1. Jenkins Setup
- Jenkins installed and running
- Required plugins installed:
  - GitHub Plugin
  - Docker Pipeline Plugin
  - Kubernetes Plugin
  - Credentials Plugin

### 2. Docker Hub Account
- Docker Hub account created
- Credentials ready for Jenkins

### 3. Kubernetes Cluster
- Kubernetes cluster configured and accessible
- `kubectl` configured in Jenkins environment

## Setup Steps

### Step 1: Configure Jenkins Credentials

1. Go to Jenkins Dashboard → **Manage Jenkins** → **Manage Credentials**
2. Add Docker Hub credentials:
   - **Kind**: Username with password
   - **ID**: `dockerhub-creds`
   - **Username**: Your Docker Hub username
   - **Password**: Your Docker Hub password
   - **Description**: Docker Hub credentials for image push/pull

### Step 2: Configure GitHub Webhook (Optional but Recommended)

#### Option A: Webhook (Real-time triggers)
1. In your GitHub repository, go to **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `http://your-jenkins-url/github-webhook/`
3. **Content type**: `application/json`
4. **Events**: Select "Just the push event"
5. Save

#### Option B: Polling (Currently configured)
- The pipeline is set to poll every 5 minutes for changes
- Edit `Jenkinsfile` to adjust polling interval if needed

### Step 3: Create Jenkins Pipeline Job

1. Go to Jenkins Dashboard → **New Item**
2. Enter job name (e.g., `course-platform-pipeline`)
3. Select **Pipeline**
4. Click **OK**

### Step 4: Configure Pipeline Job

1. In the pipeline configuration:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: Your repository URL
   - **Credentials**: Add if repository is private
   - **Branches to build**: `*/main` or `*/master`
   - **Script Path**: `Jenkinsfile`

2. Click **Save**

### Step 5: Test the Pipeline

1. Make a small change to your repository
2. Push to the repository
3. The pipeline should automatically trigger
4. Monitor the build in Jenkins

## Pipeline Stages

### Stage 1: Checkout
- Checks out the code from the repository
- Gets Git commit hash for image tagging

### Stage 2: Build & Test
- Builds all Maven microservices
- Runs unit tests (can be skipped with `SKIP_TESTS=true` parameter)
- Creates JAR files for each service

### Stage 3: Build Docker Images
- Builds Docker images for all services:
  - eureka-server
  - config-server
  - api-gateway
  - user-service
  - course-service
  - enrollment-service
  - payment-service
  - notification-service
  - content-service
  - frontend
- Tags images with Git commit hash and `latest`

### Stage 4: Push Docker Images
- Pushes all images to Docker Hub
- Both commit hash tag and `latest` tag are pushed

### Stage 5: Pull Images & Create Containers (Docker)
- **Condition**: Only runs on `master`, `main`, `develop` branches or when `FORCE_DEPLOY=true`
- Pulls images from Docker Hub
- Stops existing containers
- Starts containers using `docker-compose up -d`

### Stage 6: Deploy to Kubernetes
- **Condition**: Only runs on `master`, `main` branches or when `FORCE_DEPLOY=true`
- Creates Kubernetes namespace if needed
- Creates Docker registry secret for pulling images
- Applies all Kubernetes manifests:
  - MySQL (with PVC)
  - Eureka Server
  - Config Server
  - All microservices
  - API Gateway
  - Frontend
- Updates deployment images with new tags
- Waits for rollouts to complete

## Manual Pipeline Execution

You can manually trigger the pipeline:

1. Go to Jenkins Dashboard → Your Pipeline Job
2. Click **Build with Parameters**
3. Set parameters if needed:
   - **FORCE_DEPLOY**: Force Kubernetes deployment even on non-main branches
   - **SKIP_TESTS**: Skip unit tests during build
4. Click **Build**

## Kubernetes Deployment Details

### Namespace
- Default namespace: `course-plat`
- Created automatically if it doesn't exist

### Services Deployed
1. **MySQL**: Database with persistent volume
2. **Eureka Server**: Service discovery (Port 8761)
3. **Config Server**: Configuration service (Port 8888)
4. **User Service**: User management (Port 8082)
5. **Course Service**: Course management (Port 8083)
6. **Enrollment Service**: Enrollment management (Port 8084)
7. **Payment Service**: Payment processing (Port 8086)
8. **Notification Service**: Notifications (Port 8085)
9. **Content Service**: Content delivery (Port 8087)
10. **API Gateway**: API Gateway (NodePort 30765)
11. **Frontend**: React frontend (NodePort 30080)

### Access Points

- **Frontend**: `http://<node-ip>:30080`
- **API Gateway**: `http://<node-ip>:30765`
- **Eureka Dashboard**: Access via port-forward:
  ```bash
  kubectl port-forward -n course-plat svc/eureka-server 8761:8761
  ```

## Troubleshooting

### Pipeline Not Triggering
1. Check if webhook is configured correctly (if using webhook)
2. Check polling schedule in Jenkinsfile (if using polling)
3. Verify Jenkins has access to the repository

### Docker Build Failures
1. Check Docker Hub credentials in Jenkins
2. Verify Dockerfile exists for each service
3. Check build logs for specific errors

### Kubernetes Deployment Failures
1. Verify `kubectl` is configured correctly:
   ```bash
   kubectl cluster-info
   kubectl get nodes
   ```
2. Check if namespace exists:
   ```bash
   kubectl get namespace course-plat
   ```
3. Check pod status:
   ```bash
   kubectl get pods -n course-plat
   kubectl describe pod <pod-name> -n course-plat
   ```
4. Check deployment status:
   ```bash
   kubectl get deployments -n course-plat
   kubectl describe deployment <deployment-name> -n course-plat
   ```

### Image Pull Errors
1. Verify Docker Hub credentials are correct
2. Check if images were pushed successfully to Docker Hub
3. Verify image names match between build and Kubernetes manifests

## Environment Variables

The pipeline uses these environment variables:
- `KUBE_NAMESPACE`: Kubernetes namespace (default: `course-plat`)
- `IMAGE_TAG`: Git commit hash (automatically generated)
- `DOCKERHUB_USER`: From Jenkins credentials

## Best Practices

1. **Always test on a branch first** before merging to main
2. **Monitor first deployment** carefully after pushing to main
3. **Use FORCE_DEPLOY parameter** sparingly
4. **Check build logs** if pipeline fails
5. **Verify services are healthy** after Kubernetes deployment:
   ```bash
   kubectl get pods -n course-plat
   kubectl logs -n course-plat <pod-name>
   ```

## Customization

### Change Image Registry
Edit `Jenkinsfile` and replace Docker Hub references with your registry (e.g., AWS ECR, Azure Container Registry)

### Adjust Resource Limits
Edit `k8s/services.yaml` and `k8s/api-gateway.yaml` to adjust memory/CPU limits

### Change Deployment Strategy
Modify Kubernetes manifests to use different deployment strategies (e.g., RollingUpdate, Blue-Green)

## Support

For issues or questions:
1. Check Jenkins build logs
2. Check Kubernetes pod logs
3. Review this documentation
4. Check service health endpoints

## Next Steps

After setting up:
1. Test the pipeline with a small change
2. Verify Docker images are pushed correctly
3. Check Kubernetes deployment
4. Test the application endpoints
5. Monitor logs for any issues

