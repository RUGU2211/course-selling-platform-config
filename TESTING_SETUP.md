# Local Testing Setup

## Environment Status

✅ **Kubernetes**: Stopped (will activate only from CI/CD pipeline)  
✅ **Docker Compose**: Running (local development)

## Access Points

### Application Services
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8765
- **Eureka Dashboard**: http://localhost:8761

### Monitoring
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3030 (admin/admin)

### Individual Services
- **User Service**: http://localhost:8082
- **Course Service**: http://localhost:8083
- **Enrollment Service**: http://localhost:8084
- **Content Service**: http://localhost:8087
- **Config Server**: http://localhost:8888

### Other
- **MySQL**: localhost:3307 (root/root)
- **Jenkins**: http://localhost:8090

## Testing New Features

### Content Management (Instructors)

1. **Login as Instructor**
   - Register with role: `INSTRUCTOR`
   - Or use existing instructor account

2. **Navigate to Your Course**
   - Go to http://localhost:3000
   - Click on your course

3. **Add Content**
   - Click "Add Content" button
   - Fill in:
     - Title: e.g., "Introduction to Java"
     - URL: e.g., "https://example.com/video.mp4"
     - Type: VIDEO, PDF, DOC, or IMAGE
   - Click "Add Content"

4. **Verify**
   - Content should appear in the list
   - Students can access after enrollment

### Testing Student Features

1. **Login as Student**
   - Register with role: `STUDENT`

2. **Browse Courses**
   - View available courses
   - Click on a course to see details

3. **Enroll in Course**
   - Click "Enroll Now" button
   - Access course content

## Running Locally

### Start All Services
```bash
docker compose up -d
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
```

### Restart Service After Changes
```bash
# Rebuild and restart
docker compose up -d --build frontend

# Or just restart
docker compose restart frontend
```

### Stop All Services
```bash
docker compose down
```

## Development Workflow

1. **Make Frontend Changes**
   - Edit files in `frontend/src/`
   - Test in browser

2. **Rebuild Frontend**
   ```bash
   docker compose up -d --build frontend
   ```

3. **Verify Changes**
   - Open http://localhost:3000
   - Hard refresh (Ctrl+F5) to clear cache

4. **Push to Git**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin master
   ```

5. **Kubernetes Deployment**
   - CI/CD pipeline will automatically:
     - Build images
     - Push to Docker Hub
     - Deploy to Kubernetes

## Database Access

### Connect to MySQL
```bash
# From terminal
docker compose exec mysql mysql -u root -proot

# Or use MySQL client
mysql -h localhost -P 3307 -u root -proot
```

### Check Databases
```sql
SHOW DATABASES;
USE users_db;
SHOW TABLES;
SELECT * FROM users;
```

## Troubleshooting

### Frontend not updating?
1. Hard refresh browser (Ctrl+F5)
2. Rebuild container: `docker compose up -d --build frontend`
3. Check browser console for errors

### API not connecting?
1. Check API Gateway health: http://localhost:8765/actuator/health
2. Check Eureka dashboard: http://localhost:8761
3. View logs: `docker compose logs api-gateway`

### Service not starting?
1. Check logs: `docker compose logs <service-name>`
2. Verify database is running
3. Check Eureka registration

## Test Credentials

### Register New Users
```bash
# Instructor
POST http://localhost:8765/user-management-service/api/users/register
{
  "username": "instructor",
  "firstName": "John",
  "lastName": "Doe",
  "email": "instructor@example.com",
  "password": "password123",
  "role": "INSTRUCTOR"
}

# Student
POST http://localhost:8765/user-management-service/api/users/register
{
  "username": "student",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "student@example.com",
  "password": "password123",
  "role": "STUDENT"
}
```

## Common Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View status
docker compose ps

# View logs
docker compose logs -f

# Rebuild specific service
docker compose up -d --build <service-name>

# Restart service
docker compose restart <service-name>

# Check health
docker compose ps
```

## Next Steps

1. ✅ Test content management as instructor
2. ✅ Test enrollment as student
3. ✅ Verify all features working
4. ✅ Push changes to trigger CI/CD
5. ✅ Verify Kubernetes deployment

---

**Remember**: Kubernetes resources are stopped for local testing. They will activate automatically when you push code to the repository via CI/CD pipeline!

