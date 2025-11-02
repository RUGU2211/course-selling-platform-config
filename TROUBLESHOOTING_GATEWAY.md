# API Gateway Troubleshooting

If your API Gateway failed to start, follow these steps on your EC2 instance:

## Quick Diagnosis

```bash
# Check API Gateway logs
docker logs course-platform-api-gateway

# Or see last 100 lines
docker logs course-platform-api-gateway --tail 100

# Check if it's running
docker ps | grep api-gateway

# Check health
docker inspect course-platform-api-gateway | grep Health -A 10
```

## Common Issues

### Issue 1: Services Not Registered in Eureka Yet

**Symptom:** API Gateway starts but fails health check because services aren't registered yet.

**Solution:** Wait and restart

```bash
# Wait 5 minutes for all services to fully register
# Then restart API Gateway
docker-compose restart api-gateway

# Check status
docker-compose logs api-gateway -f
```

### Issue 2: Connection Refused

**Symptom:** Can't connect to Eureka or Config Server

**Solution:** Check dependencies

```bash
# Verify Eureka is running
docker ps | grep eureka

# Verify Config Server is running  
docker ps | grep config

# Check networks
docker network inspect course-selling-platf_microservices-network
```

### Issue 3: Config Server Not Ready

**Symptom:** API Gateway tries to connect to config server before it's ready

**Solution:** Increase startup time

```bash
# Stop API Gateway
docker-compose stop api-gateway

# Start dependencies first
docker-compose up -d eureka-server config-server

# Wait 5 minutes
sleep 300

# Start API Gateway
docker-compose up -d api-gateway

# Watch logs
docker-compose logs api-gateway -f
```

### Issue 4: Port Already in Use

**Symptom:** Port 8765 already in use

**Solution:** Find and kill process

```bash
# Find what's using the port
sudo netstat -tlnp | grep 8765

# Or
sudo lsof -i :8765

# Stop all containers and restart
docker-compose down
docker-compose up -d
```

### Issue 5: Docker Compose Startup Order

**Solution:** Manual startup in correct order

```bash
# Stop everything
docker-compose down

# Start in order
docker-compose up -d mysql
sleep 60  # Wait for MySQL

docker-compose up -d eureka-server
sleep 30  # Wait for Eureka

docker-compose up -d config-server
sleep 60  # Wait for Config Server

docker-compose up -d user-service course-service enrollment-service content-service actuator
sleep 120  # Wait for services to register

docker-compose up -d api-gateway
sleep 60  # Wait for gateway

docker-compose up -d frontend

# Check everything
docker-compose ps
```

## Manual Testing

### Test API Gateway Directly

```bash
# Test health endpoint
curl http://localhost:8765/actuator/health

# Test gateway info
curl http://localhost:8765/actuator/gateway/routes

# Test gateway routes
curl http://localhost:8765/actuator/gateway/routedefinitions
```

### Test from Inside Container

```bash
# Enter API Gateway container
docker exec -it course-platform-api-gateway sh

# Test locally
curl http://localhost:8765/actuator/health

# Test Eureka connection
curl http://course-platform-eureka:8761

# Exit
exit
```

## Force Rebuild

If all else fails:

```bash
# Complete rebuild
docker-compose down -v
docker-compose up -d --build

# Watch for API Gateway specifically
docker-compose logs api-gateway -f
```

## Check Eureka Registration

API Gateway must register with Eureka to work:

```bash
# Check Eureka dashboard
curl http://localhost:8761

# Or open in browser
# http://YOUR_EC2_IP:8761

# Look for "api-gateway" in the registered services
```

## Expected Logs

When API Gateway starts successfully, you should see:

```
Started ApiGatewayApplication
Registered API Gateway with Eureka
Refreshing DiscoveryClient
DiscoveryClient started
Netty started on port 8765
```

## Access After Fix

Once API Gateway is running:

- **API Gateway:** `http://YOUR_EC2_IP:8765`
- **Health Check:** `http://YOUR_EC2_IP:8765/actuator/health`
- **Eureka:** `http://YOUR_EC2_IP:8761`

## Still Failing?

Share these logs for help:

```bash
# Get full logs
docker logs course-platform-api-gateway > api-gateway-logs.txt

# Get status
docker-compose ps > services-status.txt

# Check all service logs
docker-compose logs > all-logs.txt
```

Then share the contents of these files for debugging.

