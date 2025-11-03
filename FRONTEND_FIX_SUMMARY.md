# Frontend 404 Error Fix Summary

## Problem
Frontend was getting 404 errors when calling API endpoints:
- `GET http://3.101.30.231:3000/course-management-service/api/courses 404 (Not Found)`
- `GET http://3.101.30.231:3000/user-management-service/api/users/stats 404 (Not Found)`
- `POST http://3.101.30.231:3000/user-management-service/api/users/login 403 (Forbidden)`

## Root Causes

### 1. API Gateway Route Rewriting
The API Gateway was receiving requests like `/course-management-service/api/courses` but forwarding the full path to the backend service. Backend services expect paths like `/api/courses` (without the service prefix).

### 2. CORS Configuration
CORS was only allowing `localhost:3000`, but the frontend is accessed via EC2 IP address (`3.101.30.231:3000`).

### 3. Nginx Proxy Configuration
The nginx proxy configuration needed a small fix for the `/api/` location block.

## Fixes Applied

### 1. API Gateway Configuration (`config-server/src/main/resources/config/api-gateway.yml`)

**Added RewritePath filters** to strip service prefixes before forwarding to backend services:

```yaml
routes:
  - id: user-management-service
    uri: lb://user-management-service
    predicates:
      - Path=/user-management-service/**
    filters:
      - RewritePath=/user-management-service/(?<segment>.*), /$\{segment}
  
  - id: course-management-service
    uri: lb://course-management-service
    predicates:
      - Path=/course-management-service/**
    filters:
      - RewritePath=/course-management-service/(?<segment>.*), /$\{segment}
  
  # ... similar for other services
```

This ensures:
- Request: `http://gateway:8765/course-management-service/api/courses`
- Rewritten before forwarding: `/api/courses`
- Backend service receives: `/api/courses` ✅

**Updated CORS** to allow all origins:
```yaml
allowedOrigins:
  - "http://localhost:3000"
  - "http://localhost:5173"
  - "http://localhost:5174"
  - "http://*"  # Allow any HTTP origin
  - "*"         # Fallback for any origin
```

### 2. Nginx Configuration (`frontend/nginx.conf`)

**Fixed `/api/` location block** to properly proxy:
```nginx
location /api/ {
    proxy_pass http://course-platform-api-gateway:8765/;
    # ... other proxy settings
}
```

## How It Works Now

### Request Flow:
1. **Browser:** `GET http://3.101.30.231:3000/course-management-service/api/courses`
2. **Nginx (Frontend):** Proxies to `http://course-platform-api-gateway:8765/course-management-service/api/courses`
3. **API Gateway:** Receives `/course-management-service/api/courses`
4. **API Gateway RewritePath:** Strips prefix → `/api/courses`
5. **API Gateway:** Forwards to `lb://course-management-service/api/courses`
6. **Backend Service:** Receives `/api/courses` ✅
7. **Backend Service:** Returns response
8. **Response flows back through the chain**

## After Pulling Changes on EC2

```bash
# 1. Pull latest changes
cd ~/course-selling-platf
git pull origin master

# 2. Rebuild config-server (to pick up new config)
docker compose build config-server

# 3. Rebuild frontend (to pick up new nginx config)
docker compose build frontend

# 4. Restart services (config-server restart will trigger other services to refresh)
docker compose restart config-server
docker compose restart api-gateway
docker compose restart frontend

# 5. Wait 2-3 minutes for services to refresh configs

# 6. Test the API
curl http://localhost:8765/course-management-service/api/courses
curl http://localhost:8765/user-management-service/api/users/stats

# 7. Test from browser
# Visit: http://YOUR_EC2_IP:3000
# Check browser console - should no longer see 404 errors
```

## Verification

After applying fixes, verify:

1. **API Gateway routes are correct:**
   ```bash
   curl http://localhost:8765/actuator/gateway/routes
   ```

2. **Test API directly through Gateway:**
   ```bash
   curl http://localhost:8765/course-management-service/api/courses
   curl http://localhost:8765/user-management-service/api/users/stats
   ```

3. **Test from frontend (browser):**
   - Open browser console
   - Navigate to `http://YOUR_EC2_IP:3000`
   - Check Network tab - API calls should return 200 OK instead of 404

4. **Check nginx logs:**
   ```bash
   docker logs course-platform-frontend --tail 50
   ```

5. **Check API Gateway logs:**
   ```bash
   docker logs course-platform-api-gateway --tail 50 | grep -i "route\|rewrite"
   ```

## Expected Behavior

✅ **Before Fix:**
- Frontend calls: `/course-management-service/api/courses`
- API Gateway forwards: `/course-management-service/api/courses`
- Backend receives: `/course-management-service/api/courses`
- Backend has no route → **404 Not Found** ❌

✅ **After Fix:**
- Frontend calls: `/course-management-service/api/courses`
- API Gateway rewrites: `/api/courses`
- API Gateway forwards: `/api/courses`
- Backend receives: `/api/courses`
- Backend has route → **200 OK** ✅

## Files Changed

1. `config-server/src/main/resources/config/api-gateway.yml`
   - Added `RewritePath` filters for all service routes
   - Updated CORS to allow EC2 IP origins

2. `frontend/nginx.conf`
   - Fixed `/api/` location proxy_pass directive

## Notes

- The config-server changes require rebuilding and restarting the config-server
- Other services will automatically refresh their configs from config-server
- The frontend rebuild is needed to pick up the new nginx.conf
- Allow 2-3 minutes after restart for all services to refresh configurations

---

**Date:** 2024-11-03
**Status:** Fixed and ready to deploy

