#!/bin/bash

# Build Docker Image Script for Jenkins Pipeline
# Usage: ./build-docker-image.sh <service-name> <dockerfile-path> <build-context> <tag>

set -euo pipefail

SERVICE_NAME=${1:-""}
DOCKERFILE_PATH=${2:-"Dockerfile"}
BUILD_CONTEXT=${3:-"."}
TAG=${4:-"latest"}
REGISTRY=${DOCKER_REGISTRY:-"ghcr.io"}
ORGANIZATION=${GITHUB_USERNAME:-"your-org"}

if [ -z "$SERVICE_NAME" ]; then
    echo "Error: Service name is required"
    echo "Usage: $0 <service-name> [dockerfile-path] [build-context] [tag]"
    exit 1
fi

# Construct image name
IMAGE_NAME="${REGISTRY}/${ORGANIZATION}/${SERVICE_NAME}:${TAG}"
LATEST_IMAGE_NAME="${REGISTRY}/${ORGANIZATION}/${SERVICE_NAME}:latest"

echo "Building Docker image: $IMAGE_NAME"
echo "Dockerfile: $DOCKERFILE_PATH"
echo "Build context: $BUILD_CONTEXT"

# Build the image
docker build \
    --file "$DOCKERFILE_PATH" \
    --tag "$IMAGE_NAME" \
    --tag "$LATEST_IMAGE_NAME" \
    --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
    --build-arg VCS_REF="$(git rev-parse --short HEAD)" \
    --build-arg VERSION="$TAG" \
    --label "org.opencontainers.image.created=$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
    --label "org.opencontainers.image.revision=$(git rev-parse HEAD)" \
    --label "org.opencontainers.image.version=$TAG" \
    --label "org.opencontainers.image.source=https://github.com/${ORGANIZATION}/course-selling-platform" \
    --label "org.opencontainers.image.title=$SERVICE_NAME" \
    --label "org.opencontainers.image.description=Course Selling Platform - $SERVICE_NAME" \
    "$BUILD_CONTEXT"

echo "Successfully built Docker image: $IMAGE_NAME"

# Verify the image
echo "Verifying image..."
docker images "$IMAGE_NAME"

# Run security scan if Trivy is available
if command -v trivy &> /dev/null; then
    echo "Running security scan with Trivy..."
    trivy image --exit-code 0 --severity HIGH,CRITICAL "$IMAGE_NAME"
else
    echo "Trivy not found, skipping security scan"
fi

echo "Docker image build completed successfully"