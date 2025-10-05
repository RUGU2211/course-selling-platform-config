#!/bin/bash

# Deploy to Kubernetes Script for Jenkins Pipeline
# Usage: ./deploy-to-k8s.sh <environment> <service-name> <image-tag> [namespace]

set -euo pipefail

ENVIRONMENT=${1:-""}
SERVICE_NAME=${2:-""}
IMAGE_TAG=${3:-"latest"}
NAMESPACE=${4:-"course-platform"}
REGISTRY=${DOCKER_REGISTRY:-"ghcr.io"}
ORGANIZATION=${GITHUB_USERNAME:-"your-org"}

if [ -z "$ENVIRONMENT" ] || [ -z "$SERVICE_NAME" ]; then
    echo "Error: Environment and service name are required"
    echo "Usage: $0 <environment> <service-name> <image-tag> [namespace]"
    echo "Environments: development, staging, production"
    exit 1
fi

# Validate environment
case $ENVIRONMENT in
    development|staging|production)
        echo "Deploying to $ENVIRONMENT environment"
        ;;
    *)
        echo "Error: Invalid environment. Use: development, staging, or production"
        exit 1
        ;;
esac

# Construct image name
IMAGE_NAME="${REGISTRY}/${ORGANIZATION}/${SERVICE_NAME}:${IMAGE_TAG}"

echo "Deploying service: $SERVICE_NAME"
echo "Environment: $ENVIRONMENT"
echo "Image: $IMAGE_NAME"
echo "Namespace: $NAMESPACE"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed or not in PATH"
    exit 1
fi

# Check if we can connect to the cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: Cannot connect to Kubernetes cluster"
    exit 1
fi

# Create namespace if it doesn't exist
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Set the deployment file based on service
DEPLOYMENT_FILE=""
case $SERVICE_NAME in
    frontend)
        DEPLOYMENT_FILE="k8s/frontend-deployment.yaml"
        ;;
    api-gateway)
        DEPLOYMENT_FILE="k8s/api-gateway-deployment.yaml"
        ;;
    user-service)
        DEPLOYMENT_FILE="k8s/user-service-deployment.yaml"
        ;;
    course-service)
        DEPLOYMENT_FILE="k8s/course-service-deployment.yaml"
        ;;
    enrollment-service)
        DEPLOYMENT_FILE="k8s/enrollment-service-deployment.yaml"
        ;;
    notification-service)
        DEPLOYMENT_FILE="k8s/notification-service-deployment.yaml"
        ;;
    payment-service)
        DEPLOYMENT_FILE="k8s/payment-service-deployment.yaml"
        ;;
    content-service)
        DEPLOYMENT_FILE="k8s/content-service-deployment.yaml"
        ;;
    *)
        echo "Warning: Unknown service $SERVICE_NAME, using generic deployment"
        DEPLOYMENT_FILE="k8s/${SERVICE_NAME}-deployment.yaml"
        ;;
esac

# Check if deployment file exists
if [ ! -f "$DEPLOYMENT_FILE" ]; then
    echo "Error: Deployment file $DEPLOYMENT_FILE not found"
    exit 1
fi

# Update the image in the deployment
echo "Updating deployment with new image..."
kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${IMAGE_NAME} -n ${NAMESPACE}

# Apply the deployment configuration
echo "Applying deployment configuration..."
kubectl apply -f "$DEPLOYMENT_FILE" -n "$NAMESPACE"

# Wait for rollout to complete
echo "Waiting for rollout to complete..."
kubectl rollout status deployment/${SERVICE_NAME} -n ${NAMESPACE} --timeout=300s

# Verify the deployment
echo "Verifying deployment..."
kubectl get pods -l app.kubernetes.io/name=${SERVICE_NAME} -n ${NAMESPACE}

# Check if the service is healthy
echo "Checking service health..."
REPLICAS=$(kubectl get deployment ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.status.readyReplicas}')
DESIRED=$(kubectl get deployment ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.spec.replicas}')

if [ "$REPLICAS" = "$DESIRED" ]; then
    echo "✅ Deployment successful! $REPLICAS/$DESIRED replicas are ready"
else
    echo "❌ Deployment failed! Only $REPLICAS/$DESIRED replicas are ready"
    
    # Show recent events for debugging
    echo "Recent events:"
    kubectl get events -n ${NAMESPACE} --sort-by='.lastTimestamp' | tail -10
    
    # Show pod logs for debugging
    echo "Pod logs:"
    kubectl logs -l app.kubernetes.io/name=${SERVICE_NAME} -n ${NAMESPACE} --tail=50
    
    exit 1
fi

# Run smoke tests if available
SMOKE_TEST_SCRIPT="scripts/smoke-test-${SERVICE_NAME}.sh"
if [ -f "$SMOKE_TEST_SCRIPT" ]; then
    echo "Running smoke tests..."
    bash "$SMOKE_TEST_SCRIPT" "$ENVIRONMENT" "$NAMESPACE"
else
    echo "No smoke tests found for $SERVICE_NAME"
fi

echo "Deployment to $ENVIRONMENT completed successfully!"