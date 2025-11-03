# Troubleshooting Maven Build Issues on EC2

## Problem: Maven Dependency Download Failures

**Error Message:**
```
[ERROR] Could not transfer artifact ... from/to central (https://repo.maven.apache.org/maven2): 
Remote host terminated the handshake
```

This occurs when Maven cannot download dependencies due to network/SSL issues.

---

## Solution 1: Rebuild the Failed Service (Recommended)

The `enrollment-service` Dockerfile has been updated with retry logic. Rebuild just this service:

```bash
# Navigate to project directory
cd ~/course-selling-platf

# Rebuild only the enrollment service
docker compose build enrollment-service

# Start all services
docker compose up -d
```

---

## Solution 2: Build with Increased Timeout

If you need to manually build a service, use these Maven options:

```bash
# Build with extended timeouts and retries
mvn -U \
    -Dmaven.wagon.http.retryHandler.count=5 \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=300 \
    -Dmaven.wagon.httpconnectionManager.eagerCheckEnabled=true \
    -DskipTests \
    clean package
```

---

## Solution 3: Clear Maven Cache and Retry

Sometimes cached dependencies are corrupted:

```bash
# Clear Docker build cache
docker builder prune -a

# Clear Maven cache inside container (if already built)
docker exec -it course-platform-enrollment-service rm -rf /root/.m2/repository

# Rebuild
docker compose build enrollment-service
```

---

## Solution 4: Build Services Individually

If bulk build fails, build services one at a time:

```bash
# Stop all services first
docker compose down

# Build services individually
docker compose build eureka-server
docker compose build config-server
docker compose build actuator
docker compose build user-service
docker compose build course-service
docker compose build enrollment-service  # This was the failing one
docker compose build content-service
docker compose build api-gateway
docker compose build frontend

# Then start all
docker compose up -d
```

---

## Solution 5: Check Network Connectivity from Container

Test if the container can reach Maven Central:

```bash
# Create a test container
docker run -it --rm maven:3.9.9-eclipse-temurin-21 bash

# Inside the container, test connectivity
curl -I https://repo1.maven.org/maven2
ping -c 3 repo1.maven.org

# Test DNS
nslookup repo1.maven.org
```

---

## Solution 6: Use Alternative Maven Repository

If Maven Central continues to fail, you can use an alternative mirror. Create a `settings.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0">
  <mirrors>
    <mirror>
      <id>aliyun</id>
      <name>Aliyun Maven</name>
      <url>https://maven.aliyun.com/repository/public</url>
      <mirrorOf>central</mirrorOf>
    </mirror>
  </mirrors>
</settings>
```

Then mount this file in your Dockerfile or docker-compose.yml.

---

## Solution 7: Build with Verbose Output

To see detailed error messages:

```bash
# Build with verbose logging
docker compose build enrollment-service --progress=plain --no-cache

# Or with Maven debug
# Edit Dockerfile: change `mvn -q` to `mvn -X`
```

---

## Solution 8: Wait and Retry

Network issues are often temporary. Wait 5-10 minutes and retry:

```bash
# Wait for network to stabilize
sleep 600

# Retry build
docker compose build enrollment-service
```

---

## What Was Fixed in enrollment-service/Dockerfile

The Dockerfile now includes:

1. **Maven Settings Configuration** - Explicit repository configuration
2. **Retry Logic** - Automatic retry on failure (waits 15 seconds)
3. **Extended Timeouts** - Longer connection timeouts (300 seconds)
4. **Connection Pool Settings** - Better connection management
5. **Update Flag** - `-U` flag forces dependency updates

---

## Quick Fix Commands

### Option A: Rebuild Everything (Takes 15-20 minutes)
```bash
cd ~/course-selling-platf
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Option B: Rebuild Just Enrollment Service (Faster)
```bash
cd ~/course-selling-platf
docker compose build enrollment-service
docker compose up -d enrollment-service
```

### Option C: Check What's Already Built
```bash
# See what images exist
docker images | grep course-platform

# See what containers are running
docker compose ps

# See build logs
docker compose logs enrollment-service
```

---

## Prevention for Future Builds

1. **Enable Swap Space** (Already done if following guide)
   ```bash
   free -h  # Should show swap space
   ```

2. **Check Available Disk Space**
   ```bash
   df -h  # Ensure enough space for Docker images
   ```

3. **Monitor Network During Build**
   ```bash
   # Watch network usage during build
   watch -n 1 'netstat -i'
   ```

4. **Use Docker BuildKit** (Already enabled)
   ```bash
   export DOCKER_BUILDKIT=1
   export COMPOSE_DOCKER_CLI_BUILD=1
   ```

---

## Verify Fix

After rebuilding, check if enrollment service is running:

```bash
# Check service status
docker compose ps enrollment-service

# Check logs
docker compose logs enrollment-service

# Test health endpoint (after it's up)
curl http://localhost:8084/enrollment-service/actuator/health
```

---

## Still Having Issues?

1. **Check Docker Logs:**
   ```bash
   docker compose logs enrollment-service --tail=100
   ```

2. **Check EC2 Instance Resources:**
   ```bash
   free -h  # Memory
   df -h    # Disk
   top      # CPU/Memory usage
   ```

3. **Check Network:**
   ```bash
   ping -c 3 repo1.maven.org
   curl -I https://repo1.maven.org/maven2
   ```

4. **Review Docker Compose:**
   ```bash
   docker compose config | grep enrollment
   ```

---

## Common Network Issues on EC2

1. **Temporary Network Blips** - Retry usually works
2. **Rate Limiting** - Wait and retry
3. **SSL Certificate Issues** - Usually resolves itself
4. **EC2 Instance Network Bandwidth** - Free tier has limits
5. **Regional DNS Issues** - Can use alternative mirrors

---

**Last Updated:** After fixing enrollment-service Dockerfile with retry logic

