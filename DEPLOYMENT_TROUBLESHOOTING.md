# Deployment Troubleshooting Guide

## Issues Identified and Fixed

### 1. **Duplicate Workflow Files**
- **Problem**: Two workflow files (`deploy.yml` and `cicd.yml`) with the same name and trigger
- **Fix**: Renamed `cicd.yml` to avoid conflicts

### 2. **Docker Tag Inconsistency**
- **Problem**: Build command missing `:latest` tag while push command included it
- **Fix**: Added `:latest` tag to build command for consistency

### 3. **Poor Error Handling**
- **Problem**: Container removal would fail if container doesn't exist
- **Fix**: Added proper error handling with conditional checks

### 4. **Missing Nginx Configuration**
- **Problem**: No proper nginx config for React Router support
- **Fix**: Added custom `nginx.conf` with proper routing

### 5. **No Health Checks**
- **Problem**: No way to verify if application is running properly
- **Fix**: Added health checks and verification steps

## Updated Files

### 1. `.github/workflows/deploy.yml`
- Uses modern Docker actions
- Better error handling
- Comprehensive debugging steps
- Health checks and verification

### 2. `Dockerfile`
- Improved build process
- Added health check
- Better nginx configuration
- Optimized for production

### 3. `nginx.conf`
- Proper React Router support
- Security headers
- Performance optimizations
- Health check endpoint

## Common Deployment Issues

### 1. **Self-Hosted Runner Issues**
```bash
# Check if runner is online
# Go to GitHub repository → Settings → Actions → Runners
```

### 2. **Docker Hub Authentication**
```bash
# Verify secrets are set correctly
# Repository → Settings → Secrets and variables → Actions
```

### 3. **Port Conflicts**
```bash
# Check if port 3000 is already in use
netstat -tlnp | grep :3000
```

### 4. **Container Not Starting**
```bash
# Check container logs
docker logs reactjs-app-container

# Check container status
docker ps -a
```

## Debugging Steps

### 1. **Run the debug script on your self-hosted runner:**
```bash
./debug-deployment.sh
```

### 2. **Manual debugging commands:**
```bash
# Check Docker installation
docker --version
docker info

# Check Docker Hub login
docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD

# Pull and run manually
docker pull kirtan330/reactjs-app:latest
docker run -d -p 3000:80 --name test-container kirtan330/reactjs-app:latest

# Check if it's working
curl http://localhost:3000
```

### 3. **Check GitHub Actions logs:**
- Go to your repository
- Click on "Actions" tab
- Check the latest workflow run
- Look for any error messages in the deploy job

## Required Secrets

Make sure these secrets are set in your GitHub repository:

1. `DOCKER_USERNAME` - Your Docker Hub username
2. `DOCKER_PASSWORD` - Your Docker Hub password/token
3. `REACT_APP_SERVER_BASE_URL` - Your backend API URL

## Testing the Deployment

1. **Push to main branch** to trigger the workflow
2. **Monitor the Actions tab** for any errors
3. **Check the deploy job logs** for detailed information
4. **Test the application** at `http://your-server-ip:3000`

## If Still Not Working

1. **Check self-hosted runner status**
2. **Verify Docker installation on runner**
3. **Check network connectivity**
4. **Review container logs**
5. **Ensure secrets are correctly set**

## Contact Information

If you continue to have issues, please provide:
- GitHub Actions workflow run logs
- Output from the debug script
- Any error messages from the self-hosted runner