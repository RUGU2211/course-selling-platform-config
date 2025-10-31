# Jenkins Startup Guide

## ❌ No - Jenkins Won't Auto-Start When You Push Code

**Important**: If your Jenkins container is **stopped**, pushing code **will NOT** automatically start it or trigger the pipeline.

### Why?
- Jenkins needs to be **running** to detect code pushes
- Jenkins polls the repository every 5 minutes (or listens for webhooks)
- If Jenkins is stopped, it can't detect or process pushes

## ✅ Solution 1: Start Jenkins Manually (Before Push)

### Option A: Start Jenkins Only
```bash
# Start Jenkins container only
docker start course-platform-jenkins

# Or using docker-compose
docker-compose up -d jenkins
```

### Option B: Start All Services (Including Jenkins)
```bash
# Start all services including Jenkins
docker-compose up -d
```

### Verify Jenkins is Running
```bash
# Check if Jenkins is running
docker ps | grep jenkins

# Or check all containers
docker-compose ps
```

### Access Jenkins
- **URL**: `http://localhost:8090`
- Jenkins should be accessible at this port when running

## ✅ Solution 2: Configure Auto-Restart (Recommended)

Update `docker-compose.yml` to restart Jenkins automatically:

```yaml
jenkins:
  build: ./ci/jenkins
  container_name: course-platform-jenkins
  user: root
  restart: unless-stopped  # ← Add this line
  ports:
    - "8090:8080"
  # ... rest of config
```

This ensures Jenkins:
- ✅ Automatically starts when Docker starts
- ✅ Restarts if it crashes
- ✅ Restarts if Docker is restarted
- ✅ Only stops if you manually stop it

## 🔄 Complete Workflow

### Step 1: Ensure Jenkins is Running
```bash
# Check status
docker ps -a | grep jenkins

# If stopped, start it
docker start course-platform-jenkins

# Or start all services
docker-compose up -d
```

### Step 2: Verify Jenkins is Accessible
```bash
# Test Jenkins URL
curl http://localhost:8090

# Or open in browser
# http://localhost:8090
```

### Step 3: Push Your Code
```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Step 4: Pipeline Should Trigger
- ✅ Jenkins detects the push (polling every 5 minutes OR webhook)
- ✅ Pipeline runs automatically
- ✅ Services are built and deployed

## 🔍 Check Jenkins Status

### View Jenkins Container Status
```bash
# Check if running
docker ps | grep jenkins

# Check container logs
docker logs course-platform-jenkins

# View recent logs
docker logs --tail 100 -f course-platform-jenkins
```

### Check Jenkins Pipeline Jobs
1. Open Jenkins: `http://localhost:8090`
2. Go to **Dashboard** → **Your Pipeline Job**
3. Check if it's polling or waiting for triggers

## ⚡ Quick Commands

### Start Jenkins
```bash
docker start course-platform-jenkins
```

### Stop Jenkins
```bash
docker stop course-platform-jenkins
```

### Restart Jenkins
```bash
docker restart course-platform-jenkins
```

### Start Jenkins with Docker Compose
```bash
docker-compose up -d jenkins
```

### Start All Services (Including Jenkins)
```bash
docker-compose up -d
```

## 🛠️ Update docker-compose.yml for Auto-Restart

Would you like me to update your `docker-compose.yml` to add the `restart: unless-stopped` policy to Jenkins? This will ensure Jenkins automatically starts when Docker starts.

## 📝 Summary

**Question**: Will Jenkins auto-start when I push code?
**Answer**: ❌ **NO** - Jenkins must be running first

**Workflow**:
1. ✅ Start Jenkins manually (if stopped)
2. ✅ Verify Jenkins is accessible
3. ✅ Push your code
4. ✅ Pipeline triggers automatically

**Best Practice**: 
- Add `restart: unless-stopped` to Jenkins in docker-compose.yml
- Always check Jenkins status before pushing important changes
- Keep Jenkins running continuously for automatic deployments

