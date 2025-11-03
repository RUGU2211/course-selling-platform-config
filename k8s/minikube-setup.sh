#!/bin/bash
# Minikube Setup Script for AWS EC2
# This script helps set up Minikube on AWS EC2 for the Course Platform

set -e

echo "=========================================="
echo "Minikube Setup for Course Platform"
echo "=========================================="

# Check if Minikube is installed
if ! command -v minikube > /dev/null 2>&1; then
    echo "⚠ Minikube is not installed!"
    echo "Installing Minikube..."
    
    # Download Minikube
    curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
    sudo install minikube-linux-amd64 /usr/local/bin/minikube
    rm minikube-linux-amd64
    
    echo "✅ Minikube installed successfully!"
else
    echo "✅ Minikube is already installed"
    minikube version
fi

# Check if kubectl is installed
if ! command -v kubectl > /dev/null 2>&1; then
    echo "⚠ kubectl is not installed!"
    echo "Installing kubectl..."
    
    # Download kubectl
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
    rm kubectl
    
    echo "✅ kubectl installed successfully!"
else
    echo "✅ kubectl is already installed"
    kubectl version --client
fi

# Check if Docker is installed
if ! command -v docker > /dev/null 2>&1; then
    echo "⚠ Docker is not installed!"
    echo "Please install Docker first: https://docs.docker.com/engine/install/"
    exit 1
else
    echo "✅ Docker is installed"
    # Add current user to docker group if not already added
    sudo usermod -aG docker $USER || true
fi

# Start Minikube
echo ""
echo "Starting Minikube..."
if minikube status > /dev/null 2>&1; then
    echo "✅ Minikube is already running"
else
    # Start Minikube with Docker driver (for AWS EC2)
    minikube start --driver=docker --cpus=2 --memory=4096 || {
        echo "⚠ Failed to start Minikube with Docker driver, trying other options..."
        minikube start --driver=none --cpus=2 --memory=4096 || {
            echo "⚠ Failed to start Minikube, please check system requirements"
            exit 1
        }
    }
    echo "✅ Minikube started successfully!"
fi

# Enable addons
echo ""
echo "Enabling Minikube addons..."
minikube addons enable ingress 2>/dev/null || echo "⚠ Failed to enable ingress addon"
minikube addons enable metrics-server 2>/dev/null || echo "⚠ Failed to enable metrics-server addon"
minikube addons enable dashboard 2>/dev/null || echo "⚠ Failed to enable dashboard addon"

# Set kubectl context
echo ""
echo "Setting kubectl context to Minikube..."
kubectl config use-context minikube || kubectl config use-context minikube

# Verify cluster
echo ""
echo "Verifying cluster..."
kubectl cluster-info
kubectl get nodes

# Get Minikube IP
MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "N/A")
echo ""
echo "=========================================="
echo "Minikube Setup Complete!"
echo "=========================================="
echo "Minikube IP: ${MINIKUBE_IP}"
echo ""
echo "To access services:"
echo "  - Frontend: minikube service frontend -n course-plat"
echo "  - API Gateway: minikube service api-gateway -n course-plat"
echo "  - Eureka: minikube service eureka-server -n course-plat"
echo ""
echo "To open dashboard:"
echo "  - minikube dashboard"
echo ""
echo "To tunnel services (for external access):"
echo "  - minikube tunnel (run in separate terminal)"
echo ""
echo "Next steps:"
echo "  1. Create namespace: kubectl create namespace course-plat"
echo "  2. Create Docker registry secret (for pulling images)"
echo "  3. Apply Kubernetes manifests: kubectl apply -f k8s/ -n course-plat"
echo "=========================================="

