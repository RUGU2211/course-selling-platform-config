#!/bin/bash

# Jenkins Monitoring Setup Script
# This script sets up comprehensive monitoring for Jenkins using Prometheus, Grafana, and Alertmanager

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MONITORING_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_COMPOSE_FILE="docker-compose-monitoring.yml"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

setup_directories() {
    log_info "Setting up directories..."
    
    # Create necessary directories
    mkdir -p "${MONITORING_DIR}/data/prometheus"
    mkdir -p "${MONITORING_DIR}/data/grafana"
    mkdir -p "${MONITORING_DIR}/data/alertmanager"
    
    # Set proper permissions
    chmod 777 "${MONITORING_DIR}/data/grafana"
    
    log_success "Directories created"
}

configure_monitoring() {
    log_info "Configuring monitoring stack..."
    
    # Check if configuration files exist
    local required_files=(
        "prometheus.yml"
        "prometheus-alerts.yml"
        "grafana-datasource.yml"
        "grafana-dashboards-provisioning.yml"
        "alertmanager.yml"
        "docker-compose-monitoring.yml"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "${MONITORING_DIR}/${file}" ]]; then
            log_error "Required file ${file} not found in ${MONITORING_DIR}"
            exit 1
        fi
    done
    
    log_success "Configuration files validated"
}

start_monitoring_stack() {
    log_info "Starting monitoring stack..."
    
    cd "${MONITORING_DIR}"
    
    # Pull latest images
    log_info "Pulling latest Docker images..."
    docker-compose -f "${DOCKER_COMPOSE_FILE}" pull
    
    # Start the stack
    log_info "Starting containers..."
    docker-compose -f "${DOCKER_COMPOSE_FILE}" up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Check if services are running
    if docker-compose -f "${DOCKER_COMPOSE_FILE}" ps | grep -q "Up"; then
        log_success "Monitoring stack started successfully"
    else
        log_error "Failed to start monitoring stack"
        docker-compose -f "${DOCKER_COMPOSE_FILE}" logs
        exit 1
    fi
}

verify_services() {
    log_info "Verifying services..."
    
    local services=(
        "prometheus:9090"
        "grafana:3000"
        "alertmanager:9093"
        "node-exporter:9100"
    )
    
    for service in "${services[@]}"; do
        local name="${service%:*}"
        local port="${service#*:}"
        
        if curl -s "http://localhost:${port}" > /dev/null; then
            log_success "${name} is accessible on port ${port}"
        else
            log_warning "${name} is not accessible on port ${port}"
        fi
    done
}

display_access_info() {
    log_info "Access Information:"
    echo ""
    echo "📊 Grafana Dashboard: http://localhost:3000"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo ""
    echo "🔍 Prometheus: http://localhost:9090"
    echo "🚨 Alertmanager: http://localhost:9093"
    echo "📈 Node Exporter: http://localhost:9100"
    echo "🐳 cAdvisor: http://localhost:8080"
    echo ""
    echo "📋 Jenkins Dashboards:"
    echo "   - Jenkins Overview: http://localhost:3000/d/jenkins-overview"
    echo "   - Jenkins Jobs Performance: http://localhost:3000/d/jenkins-jobs-performance"
    echo ""
}

configure_jenkins_integration() {
    log_info "Jenkins Integration Notes:"
    echo ""
    echo "To complete the setup, ensure Jenkins has the Prometheus plugin installed:"
    echo "1. Install 'Prometheus metrics plugin' in Jenkins"
    echo "2. Configure the plugin at: Manage Jenkins > Configure System > Prometheus"
    echo "3. Set the path to: /prometheus"
    echo "4. Set the namespace to: jenkins"
    echo ""
    echo "Jenkins metrics will be available at: http://jenkins:8080/prometheus"
    echo ""
}

cleanup() {
    log_info "Cleaning up monitoring stack..."
    cd "${MONITORING_DIR}"
    docker-compose -f "${DOCKER_COMPOSE_FILE}" down -v
    log_success "Monitoring stack stopped and cleaned up"
}

show_help() {
    echo "Jenkins Monitoring Setup Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start the monitoring stack (default)"
    echo "  stop      Stop the monitoring stack"
    echo "  restart   Restart the monitoring stack"
    echo "  status    Show status of monitoring services"
    echo "  logs      Show logs from monitoring services"
    echo "  cleanup   Stop and remove all monitoring containers and volumes"
    echo "  help      Show this help message"
    echo ""
}

show_status() {
    log_info "Monitoring stack status:"
    cd "${MONITORING_DIR}"
    docker-compose -f "${DOCKER_COMPOSE_FILE}" ps
}

show_logs() {
    log_info "Monitoring stack logs:"
    cd "${MONITORING_DIR}"
    docker-compose -f "${DOCKER_COMPOSE_FILE}" logs -f
}

# Main execution
main() {
    local command="${1:-start}"
    
    case "${command}" in
        "start")
            check_prerequisites
            setup_directories
            configure_monitoring
            start_monitoring_stack
            verify_services
            display_access_info
            configure_jenkins_integration
            ;;
        "stop")
            cd "${MONITORING_DIR}"
            docker-compose -f "${DOCKER_COMPOSE_FILE}" down
            log_success "Monitoring stack stopped"
            ;;
        "restart")
            cd "${MONITORING_DIR}"
            docker-compose -f "${DOCKER_COMPOSE_FILE}" restart
            log_success "Monitoring stack restarted"
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Unknown command: ${command}"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"