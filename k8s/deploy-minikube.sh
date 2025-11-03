#!/bin/bash
# Deploy Course Platform to Minikube
# This script deploys all services to Minikube on AWS EC2

set -e

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# If run from k8s directory, go to parent; if run from root, stay in root
if [[ "$SCRIPT_DIR" == *"/k8s" ]]; then
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
else
    PROJECT_ROOT="$SCRIPT_DIR"
fi

K8S_DIR="${PROJECT_ROOT}/k8s"
DOCKERHUB_USER="${DOCKERHUB_USER:-rugved2211}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
NAMESPACE="course-plat"

echo "=========================================="
echo "Deploying Course Platform to Minikube"
echo "=========================================="
echo "Docker Hub User: ${DOCKERHUB_USER}"
echo "Image Tag: ${IMAGE_TAG}"
echo "Namespace: ${NAMESPACE}"
echo "K8s Directory: ${K8S_DIR}"
echo ""

# Check if Minikube is running
if ! minikube status > /dev/null 2>&1; then
    echo "⚠ Minikube is not running. Starting Minikube..."
    minikube start || {
        echo "❌ Failed to start Minikube"
        exit 1
    }
fi

# Set kubectl context
kubectl config use-context minikube

# Create namespace
echo "Creating namespace ${NAMESPACE}..."
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# Check if Docker registry secret exists
if ! kubectl get secret dockerhub-secret -n ${NAMESPACE} > /dev/null 2>&1; then
    echo "⚠ Docker registry secret not found!"
    echo "Creating Docker registry secret..."
    echo "Please enter your Docker Hub credentials:"
    read -p "Docker Hub Username: " DOCKER_USER
    read -sp "Docker Hub Password: " DOCKER_PASS
    echo ""
    
    kubectl create secret docker-registry dockerhub-secret \
        --docker-server=https://index.docker.io/v1/ \
        --docker-username=${DOCKER_USER} \
        --docker-password=${DOCKER_PASS} \
        --docker-email=${DOCKER_USER}@example.com \
        -n ${NAMESPACE}
    
    echo "✅ Docker registry secret created"
else
    echo "✅ Docker registry secret already exists"
fi

# Process and apply Kubernetes manifests
echo ""
echo "Processing Kubernetes manifests..."
K8S_PROCESSED_DIR="${K8S_DIR}/k8s-processed"
mkdir -p "${K8S_PROCESSED_DIR}"

for manifest in "${K8S_DIR}"/*.yaml; do
    if [ -f "$manifest" ]; then
        filename=$(basename "$manifest")
        
        # Skip if it's a setup/deploy script or already processed
        if [[ "$filename" == *.sh ]] || [[ "$filename" == *"processed"* ]]; then
            continue
        fi
        
        echo "Processing $filename..."
        
        # Replace placeholders
        sed "s|DOCKERHUB_USER|${DOCKERHUB_USER}|g; s|IMAGE_TAG|${IMAGE_TAG}|g" "$manifest" > "${K8S_PROCESSED_DIR}/$filename"
    fi
done

# Apply manifests in order
echo ""
echo "Applying Kubernetes manifests..."

# 1. MySQL (database)
echo "1. Deploying MySQL..."
kubectl apply -f "${K8S_PROCESSED_DIR}/mysql.yaml" -n ${NAMESPACE}

# 2. Eureka Server (service discovery)
echo "2. Deploying Eureka Server..."
kubectl apply -f "${K8S_PROCESSED_DIR}/eureka-server.yaml" -n ${NAMESPACE}
echo "   Waiting for Eureka to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/eureka-server -n ${NAMESPACE} || echo "⚠ Eureka deployment timeout"

# 3. Config Server
echo "3. Deploying Config Server..."
kubectl apply -f "${K8S_PROCESSED_DIR}/config-server.yaml" -n ${NAMESPACE}
echo "   Waiting for Config Server to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/config-server -n ${NAMESPACE} || echo "⚠ Config Server deployment timeout"

# 4. Actuator
echo "4. Deploying Actuator..."
kubectl apply -f "${K8S_PROCESSED_DIR}/actuator.yaml" -n ${NAMESPACE}

# 5. Microservices (deploy in parallel)
echo "5. Deploying Microservices..."
kubectl apply -f "${K8S_PROCESSED_DIR}/user-service.yaml" -n ${NAMESPACE}
kubectl apply -f "${K8S_PROCESSED_DIR}/course-service.yaml" -n ${NAMESPACE}
kubectl apply -f "${K8S_PROCESSED_DIR}/enrollment-service.yaml" -n ${NAMESPACE}
kubectl apply -f "${K8S_PROCESSED_DIR}/content-service.yaml" -n ${NAMESPACE}

# 6. API Gateway
echo "6. Deploying API Gateway..."
kubectl apply -f "${K8S_PROCESSED_DIR}/api-gateway.yaml" -n ${NAMESPACE}

# 7. Frontend
echo "7. Deploying Frontend..."
kubectl apply -f "${K8S_PROCESSED_DIR}/frontend.yaml" -n ${NAMESPACE}

# 8. Monitoring (optional)
if [ -f "${K8S_PROCESSED_DIR}/prometheus.yaml" ]; then
    echo "8. Deploying Prometheus..."
    kubectl apply -f "${K8S_PROCESSED_DIR}/prometheus.yaml" -n ${NAMESPACE}
fi

if [ -f "${K8S_PROCESSED_DIR}/grafana.yaml" ]; then
    echo "9. Deploying Grafana..."
    kubectl apply -f "${K8S_PROCESSED_DIR}/grafana.yaml" -n ${NAMESPACE}
fi

# Wait for deployments
echo ""
echo "Waiting for all deployments to be ready..."
kubectl wait --for=condition=available --timeout=600s deployment --all -n ${NAMESPACE} || echo "⚠ Some deployments may not be ready yet"

# Show status
echo ""
echo "=========================================="
echo "Deployment Status:"
echo "=========================================="
kubectl get deployments -n ${NAMESPACE}
echo ""
kubectl get pods -n ${NAMESPACE}
echo ""
kubectl get services -n ${NAMESPACE}

# Show access URLs
echo ""
echo "=========================================="
echo "Access URLs (Minikube):"
echo "=========================================="
MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "N/A")
echo "Minikube IP: ${MINIKUBE_IP}"
echo ""
echo "To access services:"
echo "  Frontend:    minikube service frontend -n ${NAMESPACE}"
echo "  API Gateway: minikube service api-gateway -n ${NAMESPACE}"
echo "  Eureka:      minikube service eureka-server -n ${NAMESPACE}"
echo "  Config:      minikube service config-server -n ${NAMESPACE}"
echo ""
echo "Or get NodePorts:"
kubectl get svc -n ${NAMESPACE} -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{range .spec.ports[*]}{.nodePort}{"\n"}{end}{end}' | grep -v "^$" || echo "No NodePorts found"
echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="

