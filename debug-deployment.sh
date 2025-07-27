#!/bin/bash

echo "=== Docker Deployment Debug Script ==="
echo "Date: $(date)"
echo ""

echo "1. Checking Docker installation..."
docker --version
docker info --format '{{.ServerVersion}}'
echo ""

echo "2. Checking Docker Hub login..."
docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
echo ""

echo "3. Checking available images..."
docker images | grep reactjs-app
echo ""

echo "4. Checking running containers..."
docker ps -a
echo ""

echo "5. Checking container logs (if exists)..."
if docker ps -q -f name=reactjs-app-container; then
    echo "Container logs:"
    docker logs reactjs-app-container --tail 50
else
    echo "No reactjs-app-container found"
fi
echo ""

echo "6. Checking port usage..."
netstat -tlnp | grep :3000 || echo "Port 3000 not in use"
echo ""

echo "7. Testing application health..."
curl -f http://localhost:3000/health 2>/dev/null || echo "Health check failed"
curl -f http://localhost:3000 2>/dev/null || echo "Application not responding"
echo ""

echo "8. Checking system resources..."
df -h
free -h
echo ""

echo "9. Checking Docker daemon status..."
systemctl status docker --no-pager -l
echo ""

echo "=== Debug Complete ==="