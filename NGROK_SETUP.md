# Ngrok Setup for Jenkins Webhooks

## ❌ Issue: Wrong Port

You ran: `ngrok http 8080`

But Jenkins is running on port **8090** on your host machine (not 8080).

## ✅ Correct Command

### For Jenkins Webhook:
```bash
ngrok http 8090
```

**Why?**
- Jenkins container runs on port 8080 **inside** the container
- But it's mapped to port **8090** on your host machine
- Docker mapping: `8090:8080` (host:container)
- So ngrok needs to expose port **8090**

## 🔧 Step-by-Step Setup

### Step 1: Start Ngrok
```bash
ngrok http 8090
```

You'll see output like:
```
Forwarding   https://8d2509937bb5.ngrok-free.app -> http://localhost:8090
```

### Step 2: Get Your Webhook URL
Your webhook URL should be:
```
https://8d2509937bb5.ngrok-free.app/github-webhook/
```

**Important**: Make sure it ends with `/github-webhook/` (with trailing slash)

### Step 3: Configure GitHub Webhook

1. Go to your GitHub repository
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - **Payload URL**: `https://8d2509937bb5.ngrok-free.app/github-webhook/`
   - **Content type**: `application/json`
   - **Secret**: (optional, leave empty for now)
   - **Events**: Select **"Just the push event"**
   - **Active**: ✅ Checked
4. Click **Add webhook**

### Step 4: Enable Webhook in Jenkins Job

1. Go to Jenkins → Your Pipeline Job → **Configure**
2. Scroll to **Build Triggers** section
3. Check **"GitHub hook trigger for GITScm polling"**
4. Click **Save**

## ✅ Verify It Works

### Test 1: Check Ngrok Status
Open ngrok web interface (shown in terminal):
```
http://localhost:4040
```

This shows all incoming requests and helps debug.

### Test 2: Test Webhook
1. Push a change to your repository
2. Check ngrok interface at `http://localhost:4040`
3. You should see a request from GitHub
4. Check Jenkins - pipeline should trigger immediately

### Test 3: Check GitHub Webhook
1. Go to GitHub → Your Repo → Settings → Webhooks
2. Click on your webhook
3. Check **Recent Deliveries** - should show successful deliveries

## 🔍 Verify Your Current Setup

### Check Jenkins Port
```bash
docker ps | grep jenkins
```

Should show: `0.0.0.0:8090->8080/tcp`

This confirms Jenkins is on port 8090 on host.

### Check Ngrok is Running
```bash
curl http://localhost:4040/api/tunnels
```

Or open: `http://localhost:4040` in browser

### Test Jenkins Access via Ngrok
```bash
curl https://8d2509937bb5.ngrok-free.app/login
```

Should return Jenkins login page (might need to handle ngrok warning page first).

## 🚨 Common Issues

### Issue 1: Ngrok Shows Warning Page
- **Problem**: GitHub can't reach Jenkins through ngrok warning page
- **Solution**: Use ngrok with `--host-header` flag:
  ```bash
  ngrok http 8090 --host-header="localhost:8090"
  ```

### Issue 2: Port Already in Use
- **Problem**: Another service using port 8090
- **Solution**: 
  ```bash
  # Check what's using the port
  netstat -ano | findstr :8090
  
  # Or use different port for ngrok
  ngrok http 8090 --region us
  ```

### Issue 3: Webhook Returns 403
- **Problem**: Jenkins CSRF protection
- **Solution**: Configure GitHub plugin in Jenkins or disable CSRF for webhooks

### Issue 4: Webhook Not Triggering
- **Check 1**: Verify ngrok is running: `curl http://localhost:4040`
- **Check 2**: Verify Jenkins is running: `docker ps | grep jenkins`
- **Check 3**: Check Jenkins logs: `docker logs course-platform-jenkins`
- **Check 4**: Verify webhook URL matches exactly (including trailing slash)

## 📝 Complete Webhook URL Format

### Correct Format:
```
https://<ngrok-domain>.ngrok-free.app/github-webhook/
```

### Example:
```
https://8d2509937bb5.ngrok-free.app/github-webhook/
```

### Important Points:
- ✅ Must use **https** (not http)
- ✅ Must end with `/github-webhook/` (with trailing slash)
- ✅ No additional path after `/github-webhook/`

## 🔄 Alternative: Keep Ngrok Running

### Option 1: Use ngrok in Background
```bash
# Start ngrok in background
Start-Process powershell -ArgumentList "-Command ngrok http 8090"
```

### Option 2: Use ngrok Config File
Create `~/.ngrok2/ngrok.yml`:
```yaml
authtoken: YOUR_NGROK_AUTH_TOKEN
tunnels:
  jenkins:
    proto: http
    addr: 8090
```

Then run:
```bash
ngrok start jenkins
```

## ✅ Summary

**Correct Command:**
```bash
ngrok http 8090  # NOT 8080!
```

**Your Webhook URL:**
```
https://8d2509937bb5.ngrok-free.app/github-webhook/
```

**Steps:**
1. ✅ Run: `ngrok http 8090`
2. ✅ Copy the HTTPS URL
3. ✅ Add `/github-webhook/` to the end
4. ✅ Configure in GitHub webhook settings
5. ✅ Enable in Jenkins job configuration
6. ✅ Test by pushing code

**Your pipeline will now trigger immediately after push!** 🚀

