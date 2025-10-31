# Jenkins Pipeline Trigger Setup Guide

## Problem: Pipeline Not Triggering After Push

If your pipeline is not triggering after you push code, follow these steps to fix it.

## ✅ Solution 1: Enable SCM Polling in Jenkins Job (Easiest)

### Step 1: Open Jenkins Job Configuration
1. Go to Jenkins Dashboard
2. Click on your pipeline job
3. Click **Configure**

### Step 2: Enable SCM Polling
1. Scroll to **Build Triggers** section
2. Check **"Poll SCM"** checkbox
3. Enter schedule: `* * * * *` (every minute)
   - Or `H/2 * * * *` (every 2 minutes)
   - Or `*/5 * * * *` (every 5 minutes)
4. Click **Save**

### Step 3: Test
1. Push a change to your repository
2. Wait 1-2 minutes
3. Pipeline should trigger automatically

## ✅ Solution 2: Configure GitHub Webhook (Best - Immediate)

### Step 1: Get Jenkins Webhook URL
- If Jenkins is on localhost: `http://localhost:8090/github-webhook/`
- If Jenkins has public URL: `http://your-jenkins-url/github-webhook/`
- For Docker Jenkins: Use the IP/domain where Jenkins is accessible

### Step 2: Configure GitHub Webhook
1. Go to your GitHub repository
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - **Payload URL**: `http://your-jenkins-url/github-webhook/`
   - **Content type**: `application/json`
   - **Secret**: (optional, can leave empty for now)
   - **Events**: Select **"Just the push event"**
   - **Active**: ✅ Checked
4. Click **Add webhook**

### Step 3: Enable Webhook in Jenkins Job
1. Go to Jenkins → Your Pipeline Job → **Configure**
2. Check **"Build Triggers"** → **"GitHub hook trigger for GITScm polling"**
3. Click **Save**

### Step 4: Test
1. Push a change to your repository
2. Pipeline should trigger **immediately** (within seconds)

## ✅ Solution 3: Manual Trigger (For Testing)

### Option A: Build Now
1. Go to Jenkins Dashboard → Your Pipeline Job
2. Click **"Build Now"**
3. Pipeline will run immediately

### Option B: Build with Parameters
1. Go to Jenkins Dashboard → Your Pipeline Job
2. Click **"Build with Parameters"**
3. Set parameters if needed:
   - `FORCE_DEPLOY`: true/false
   - `SKIP_TESTS`: true/false
4. Click **"Build"**

## 🔧 Current Jenkinsfile Configuration

The Jenkinsfile is now configured with:
```groovy
triggers {
  pollSCM('* * * * *') // Polls every minute
}
```

This means Jenkins will check for changes every minute.

## 📋 Troubleshooting Steps

### 1. Check Jenkins is Running
```bash
docker ps | grep jenkins
# Should show: course-platform-jenkins

# If not running:
docker start course-platform-jenkins
```

### 2. Check Jenkins Access
- Open: `http://localhost:8090`
- Verify Jenkins is accessible

### 3. Check Pipeline Job Exists
- Go to Jenkins Dashboard
- Verify your pipeline job is listed
- Check if it's enabled

### 4. Check Job Configuration
1. Click on your pipeline job → **Configure**
2. Verify:
   - ✅ **"Poll SCM"** is checked (with schedule)
   - ✅ **"Pipeline script from SCM"** is selected
   - ✅ Correct repository URL
   - ✅ Correct branch (usually `*/main` or `*/master`)

### 5. Check SCM Polling Log
1. Go to Jenkins → Your Pipeline Job
2. Click **"View Configuration"** or **"Changes"**
3. Look for SCM polling messages
4. Check if it's detecting changes

### 6. Check Jenkins Logs
```bash
# View Jenkins logs
docker logs course-platform-jenkins --tail 100

# Or follow logs
docker logs -f course-platform-jenkins
```

### 7. Verify Repository Access
- Jenkins needs access to your Git repository
- If private repo, add credentials in Jenkins:
  - **Manage Jenkins** → **Manage Credentials**
  - Add SSH key or username/password

## 🚀 Quick Fixes

### Fix 1: Enable Poll SCM (Fastest)
1. Jenkins → Your Job → Configure
2. Build Triggers → ✅ Poll SCM
3. Schedule: `* * * * *`
4. Save

### Fix 2: Restart Jenkins
```bash
docker restart course-platform-jenkins
```

### Fix 3: Re-save Pipeline Job
1. Jenkins → Your Job → Configure
2. Scroll to bottom → Click **Save** (even without changes)
3. This refreshes the job configuration

### Fix 4: Check Jenkinsfile Location
- Ensure `Jenkinsfile` is in the root of your repository
- Verify it's committed and pushed

## 📝 Verification

After setup, verify it works:

1. **Make a small change** (e.g., add a comment to README)
2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Test trigger"
   git push origin main
   ```
3. **Check Jenkins**:
   - Wait 1 minute (if using polling)
   - Or immediately (if using webhook)
   - Go to Jenkins → Your Job
   - Should see a new build starting

## 🎯 Best Practice Setup

**Recommended Configuration:**
1. ✅ Enable **GitHub Webhook** (immediate trigger)
2. ✅ Enable **SCM Polling** as backup (every 2-5 minutes)
3. ✅ Configure in both GitHub and Jenkins

This ensures:
- **Immediate trigger** via webhook
- **Fallback trigger** via polling if webhook fails

## ⚙️ Advanced: Multiple Branches

If you want triggers on multiple branches:

**In Jenkinsfile** (already configured):
- The pipeline triggers on **any branch** by default
- Uses `pollSCM` which checks all branches

**In Jenkins Job**:
1. Configure → Branch Sources
2. Add branch: `*/main`, `*/master`, `*/develop`
3. Or use: `**` (all branches)

## 📞 Still Not Working?

If pipeline still doesn't trigger:

1. **Check Jenkins Console Output**:
   - Go to Jenkins → Your Job → Last Build → Console Output
   - Look for errors or warnings

2. **Test Manual Trigger**:
   - Click "Build Now"
   - If manual works, issue is with triggers
   - If manual doesn't work, issue is with pipeline configuration

3. **Check Git Repository**:
   - Verify Jenkins can access the repository
   - Check if repository URL is correct
   - Verify branch names match

4. **Review Jenkinsfile Syntax**:
   - Ensure triggers block is correct
   - Check for any syntax errors

## ✅ Summary

**After setup:**
- ✅ Pipeline triggers every 1 minute via polling
- ✅ Or immediately via GitHub webhook (if configured)
- ✅ You can also manually trigger anytime

**Your pipeline will now trigger automatically after push!** 🚀

