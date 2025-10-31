# Deployment Overview - What Happens When You Push Code

## ✅ YES - Your Project Will Fully Run After Push!

When you push code to the repository, the **CI/CD pipeline automatically handles everything**. You **do NOT need to manually run Docker commands**.

## What Happens Automatically on Push

### 1. **Pipeline Triggers** (Automatic)
- **Webhook** (if configured): Triggers immediately on push
- **Polling** (backup): Checks every 5 minutes for changes
- No manual intervention needed!

### 2. **Build & Test** (Automatic)
- ✅ Builds all Maven services
- ✅ Runs unit tests (can be skipped with parameter)
- ✅ Packages all services as JAR files
- ✅ Builds Actuator service

### 3. **Docker Images** (Automatic)
- ✅ Creates Docker images for all 13 services:
  - Infrastructure: MySQL, Eureka, Config Server
  - Application: Actuator, API Gateway, 6 Microservices, Frontend
  - Monitoring: Prometheus, Grafana (use public images)
- ✅ Tags images with Git commit hash and `latest`
- ✅ Pushes all images to Docker Hub

### 4. **Container Creation** (Automatic - Conditional)
- **When**: Deploys on `main`, `master`, `develop` branches OR when `FORCE_DEPLOY=true`
- ✅ Pulls images from Docker Hub
- ✅ Stops existing containers
- ✅ Creates new containers with `docker-compose up -d`
- ✅ Waits for services to be healthy

### 5. **Kubernetes Deployment** (Automatic - Conditional)
- **When**: Deploys on `main`, `master` branches OR when `FORCE_DEPLOY=true`
- ✅ Creates namespace (`course-plat`)
- ✅ Creates Docker registry secret
- ✅ Deploys all services to Kubernetes:
  - MySQL with persistent volume
  - Eureka Server
  - Config Server
  - Actuator Service
  - API Gateway
  - All 6 microservices
  - Frontend
  - Prometheus
  - Grafana
- ✅ Updates deployment images
- ✅ Waits for all rollouts to complete

## Prerequisites (One-Time Setup)

### 1. Jenkins Setup ✅
- Jenkins must be running
- Pipeline job created and configured
- Jenkins has access to your Git repository

### 2. Docker Hub Credentials ✅
- Docker Hub account created
- Jenkins credentials configured:
  - **ID**: `dockerhub-creds`
  - **Username**: Your Docker Hub username
  - **Password**: Your Docker Hub password

### 3. Kubernetes Setup (If deploying to K8s) ✅
- Kubernetes cluster running and accessible
- `kubectl` configured in Jenkins
- Jenkins has cluster access

### 4. Docker Setup (For Docker Compose deployment) ✅
- Docker and Docker Compose installed on Jenkins server
- Jenkins has permission to use Docker

## What You Need to Do

### After Push:
**NOTHING!** 🎉

The pipeline handles:
1. ✅ Building code
2. ✅ Creating Docker images
3. ✅ Pushing to Docker Hub
4. ✅ Pulling images
5. ✅ Creating containers
6. ✅ Deploying to Kubernetes
7. ✅ Waiting for all services to be ready

## Access Points After Deployment

### If Deployed via Docker Compose:

**Application Services:**
- **Frontend**: `http://localhost:3000`
- **API Gateway**: `http://localhost:8765`
- **Eureka Dashboard**: `http://localhost:8761`
- **Config Server**: `http://localhost:8888`
- **Actuator**: `http://localhost:8081`

**Microservices (direct access):**
- **User Service**: `http://localhost:8082`
- **Course Service**: `http://localhost:8083`
- **Enrollment Service**: `http://localhost:8084`
- **Notification Service**: `http://localhost:8085`
- **Payment Service**: `http://localhost:8086`
- **Content Service**: `http://localhost:8087`

**Monitoring:**
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3030` (admin/admin)

**Database:**
- **MySQL**: `localhost:3307` (external), `3306` (internal)

### If Deployed to Kubernetes:

**Application Services (via NodePort):**
- **Frontend**: `http://<node-ip>:30080`
- **API Gateway**: `http://<node-ip>:30765`
- **Prometheus**: `http://<node-ip>:30090`
- **Grafana**: `http://<node-ip>:30300` (admin/admin)

**Internal Services (via Port Forward):**
```bash
# Eureka Dashboard
kubectl port-forward -n course-plat svc/eureka-server 8761:8761

# Config Server
kubectl port-forward -n course-plat svc/config-server 8888:8888

# Individual Services
kubectl port-forward -n course-plat svc/user-service 8082:8082
# etc.
```

## Deployment Branches

### Automatic Deployment to Docker Compose:
- ✅ `main` branch
- ✅ `master` branch
- ✅ `develop` branch
- ✅ Any branch with `FORCE_DEPLOY=true` parameter

### Automatic Deployment to Kubernetes:
- ✅ `main` branch
- ✅ `master` branch
- ✅ Any branch with `FORCE_DEPLOY=true` parameter

## Manual Trigger (Optional)

You can also manually trigger the pipeline:
1. Go to Jenkins → Your Pipeline Job
2. Click **Build with Parameters**
3. Set `FORCE_DEPLOY=true` to deploy regardless of branch
4. Click **Build**

## Service Health Check

After deployment, all services will:
1. ✅ Start automatically
2. ✅ Register with Eureka
3. ✅ Connect to MySQL
4. ✅ Expose health endpoints
5. ✅ Start accepting requests

### Check Service Status:

**Docker Compose:**
```bash
docker-compose ps
docker-compose logs -f
```

**Kubernetes:**
```bash
kubectl get pods -n course-plat
kubectl get services -n course-plat
kubectl logs -n course-plat deployment/<service-name>
```

## Complete Service List (13 Services)

### Infrastructure (3):
1. ✅ **MySQL** - Database
2. ✅ **Eureka Server** - Service discovery
3. ✅ **Config Server** - Configuration management

### Application (8):
4. ✅ **Actuator** - Metrics collection
5. ✅ **API Gateway** - Request routing
6. ✅ **User Service** - User management
7. ✅ **Course Service** - Course management
8. ✅ **Enrollment Service** - Enrollment management
9. ✅ **Payment Service** - Payment processing
10. ✅ **Notification Service** - Notifications
11. ✅ **Content Service** - Content delivery

### Monitoring (2):
12. ✅ **Prometheus** - Metrics collection
13. ✅ **Grafana** - Visualization

## Summary

✅ **Push Code** → Pipeline Triggers Automatically  
✅ **Builds All Services** → Creates Docker Images  
✅ **Pushes to Docker Hub** → Images Available  
✅ **Pulls Images** → Creates Containers  
✅ **Deploys to Kubernetes** → All Services Running  
✅ **Access All Services** → Everything Available!

**You don't need to:**
- ❌ Run `docker-compose up` manually
- ❌ Build Docker images manually
- ❌ Push images manually
- ❌ Deploy to Kubernetes manually
- ❌ Create containers manually

**Everything is automatic!** 🚀

## Troubleshooting

If services don't start:

1. **Check Jenkins Pipeline Logs:**
   - Go to Jenkins → Your Pipeline → Latest Build → Console Output

2. **Check Service Status:**
   ```bash
   # Docker Compose
   docker-compose ps
   
   # Kubernetes
   kubectl get pods -n course-plat
   ```

3. **Check Logs:**
   ```bash
   # Docker Compose
   docker-compose logs <service-name>
   
   # Kubernetes
   kubectl logs -n course-plat deployment/<service-name>
   ```

4. **Verify Pipeline Configuration:**
   - Docker Hub credentials are set
   - Jenkins has Docker access
   - Kubernetes is configured (if using K8s)

5. **Check Branch:**
   - Make sure you're pushing to the correct branch (`main`, `master`, or `develop`)
   - Or use `FORCE_DEPLOY=true` parameter

## Next Steps

1. ✅ Push your code
2. ✅ Wait for pipeline to complete (~5-10 minutes)
3. ✅ Access your services at the URLs above
4. ✅ Monitor in Grafana and Prometheus
5. ✅ Check Eureka Dashboard for service registration

**That's it! Everything runs automatically after push.** 🎉

