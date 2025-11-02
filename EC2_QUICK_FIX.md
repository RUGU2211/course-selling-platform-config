# Quick Fix for Docker Issue on EC2

## The Problem

Docker failed to restart after creating daemon.json configuration.

## Quick Solution

Run these commands on your EC2 instance:

```bash
# Step 1: Check Docker status
sudo systemctl status docker

# Step 2: Remove problematic daemon.json if it exists
sudo rm -f /etc/docker/daemon.json

# Step 3: Start Docker again
sudo systemctl start docker

# Step 4: Verify Docker is running
sudo systemctl status docker

# Step 5: Check Docker version
docker --version
```

## Alternative: Use the Fix Script

If you have the fix script in your repo:

```bash
# Pull latest changes
git pull origin master

# Make fix script executable
chmod +x fix-docker.sh

# Run the fix
./fix-docker.sh
```

## Continue Deployment

After Docker is working:

```bash
# Navigate to project directory
cd course-selling-platf

# Continue with deployment (skip steps 1-4 as already done)
# Pull latest code with the fix
git pull origin master

# Start services directly
docker-compose up -d --build

# Watch logs
docker-compose logs -f
```

## Manual Deployment (Simplest Option)

If you want to skip the automated script entirely:

```bash
# 1. Update system (already done)
sudo yum update -y

# 2. Ensure Git is installed (already done)
which git

# 3. Check swap is active (already done)
free -h

# 4. Clone repository (already done)
cd ~/course-selling-platf

# 5. Start services with Docker Compose
docker-compose up -d --build

# 6. Monitor logs
docker-compose logs -f
```

## Expected Build Time

- **First build:** 10-15 minutes
- **Subsequent builds:** 2-5 minutes

## What to Watch For

### Successful Start:

```
✓ course-platform-mysql      healthy
✓ course-platform-eureka     started  
✓ course-platform-frontend   started
✓ course-platform-api-gateway started
```

### If Services Don't Start:

```bash
# Check Docker is running
docker ps

# Check specific service logs
docker logs course-platform-eureka
docker logs course-platform-mysql

# Check disk space (needs at least 10GB free)
df -h

# Check memory (should have 2GB swap)
free -h
```

## Access Your Application

Once all services are running (wait 15 minutes), access:

- **Frontend:** `http://YOUR_EC2_PUBLIC_IP:3000`
- **API Gateway:** `http://YOUR_EC2_PUBLIC_IP:8765`
- **Eureka Dashboard:** `http://YOUR_EC2_PUBLIC_IP:8761`
- **Jenkins (CI/CD):** `http://YOUR_EC2_PUBLIC_IP:8090`

## Troubleshooting

### Issue: "Cannot connect to Docker daemon"

**Fix:**
```bash
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# Log out and back in
exit
# Then SSH again
```

### Issue: "Port already in use"

**Fix:**
```bash
# Find what's using the port
sudo netstat -tlnp | grep :3000

# Stop conflicting process or change port in docker-compose.yml
```

### Issue: "Out of disk space"

**Fix:**
```bash
# Check disk usage
df -h

# Clean Docker cache
docker system prune -a

# Free up space
sudo yum clean all
```

### Issue: "Build timeout"

**Fix:**
```bash
# Increase timeout or build services individually
docker-compose up -d mysql eureka-server
# Wait 5 minutes
docker-compose up -d
```

## Still Having Issues?

1. **Check logs:** `docker-compose logs -f [service-name]`
2. **Check status:** `docker-compose ps`
3. **Restart specific service:** `docker restart [container-name]`
4. **Start fresh:** `docker-compose down && docker-compose up -d`

## Need Help?

Common solutions:
- Restart Docker: `sudo systemctl restart docker`
- Check logs: `docker-compose logs -f`
- Rebuild: `docker-compose up -d --build`
- Clean start: `docker-compose down -v && docker-compose up -d --build`

---

**The key is: Just start Docker with `sudo systemctl start docker` and then run `docker-compose up -d --build`!** 

Everything else is already set up! 🚀

