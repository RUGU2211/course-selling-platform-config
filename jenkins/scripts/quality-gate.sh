#!/bin/bash

# Quality Gate Script for Jenkins Pipeline
# Usage: ./quality-gate.sh <project-key> [sonar-host] [timeout]

set -euo pipefail

PROJECT_KEY=${1:-""}
SONAR_HOST=${2:-${SONAR_HOST_URL:-"http://sonarqube:9000"}}
TIMEOUT=${3:-300}  # 5 minutes default timeout

if [ -z "$PROJECT_KEY" ]; then
    echo "Error: Project key is required"
    echo "Usage: $0 <project-key> [sonar-host] [timeout]"
    exit 1
fi

echo "Checking SonarQube Quality Gate for project: $PROJECT_KEY"
echo "SonarQube Host: $SONAR_HOST"
echo "Timeout: ${TIMEOUT}s"

# Function to check if SonarQube is accessible
check_sonarqube_health() {
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Checking SonarQube health (attempt $attempt/$max_attempts)..."
        
        if curl -s -f "$SONAR_HOST/api/system/health" > /dev/null; then
            echo "✅ SonarQube is healthy"
            return 0
        fi
        
        echo "⏳ SonarQube not ready, waiting 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    echo "❌ SonarQube is not accessible after $max_attempts attempts"
    return 1
}

# Function to get the latest analysis task
get_latest_task() {
    local response
    response=$(curl -s -u "${SONAR_TOKEN}:" \
        "$SONAR_HOST/api/ce/component?component=$PROJECT_KEY" \
        | jq -r '.queue[0].id // .current.id // empty')
    
    if [ -z "$response" ] || [ "$response" = "null" ]; then
        echo "❌ No analysis task found for project $PROJECT_KEY"
        return 1
    fi
    
    echo "$response"
}

# Function to wait for analysis completion
wait_for_analysis() {
    local task_id=$1
    local elapsed=0
    
    echo "Waiting for analysis task $task_id to complete..."
    
    while [ $elapsed -lt $TIMEOUT ]; do
        local status
        status=$(curl -s -u "${SONAR_TOKEN}:" \
            "$SONAR_HOST/api/ce/task?id=$task_id" \
            | jq -r '.task.status')
        
        case $status in
            "SUCCESS")
                echo "✅ Analysis completed successfully"
                return 0
                ;;
            "FAILED"|"CANCELED")
                echo "❌ Analysis failed with status: $status"
                return 1
                ;;
            "PENDING"|"IN_PROGRESS")
                echo "⏳ Analysis in progress... (${elapsed}s elapsed)"
                sleep 10
                elapsed=$((elapsed + 10))
                ;;
            *)
                echo "❓ Unknown status: $status"
                sleep 10
                elapsed=$((elapsed + 10))
                ;;
        esac
    done
    
    echo "❌ Analysis timed out after ${TIMEOUT}s"
    return 1
}

# Function to get quality gate status
get_quality_gate_status() {
    local response
    response=$(curl -s -u "${SONAR_TOKEN}:" \
        "$SONAR_HOST/api/qualitygates/project_status?projectKey=$PROJECT_KEY")
    
    local status
    status=$(echo "$response" | jq -r '.projectStatus.status')
    
    echo "$status"
    
    # Print detailed conditions
    echo "Quality Gate Conditions:"
    echo "$response" | jq -r '.projectStatus.conditions[]? | "  \(.metricKey): \(.actualValue) \(.comparator) \(.errorThreshold) (\(.status))"'
}

# Function to get project metrics
get_project_metrics() {
    local metrics="coverage,duplicated_lines_density,maintainability_rating,reliability_rating,security_rating,sqale_rating,bugs,vulnerabilities,code_smells,ncloc"
    
    local response
    response=$(curl -s -u "${SONAR_TOKEN}:" \
        "$SONAR_HOST/api/measures/component?component=$PROJECT_KEY&metricKeys=$metrics")
    
    echo "Project Metrics:"
    echo "$response" | jq -r '.component.measures[]? | "  \(.metric): \(.value // "N/A")"'
}

# Function to generate quality report
generate_quality_report() {
    local status=$1
    local report_file="quality-gate-report.json"
    
    echo "Generating quality gate report..."
    
    local response
    response=$(curl -s -u "${SONAR_TOKEN}:" \
        "$SONAR_HOST/api/qualitygates/project_status?projectKey=$PROJECT_KEY")
    
    echo "$response" > "$report_file"
    echo "Quality gate report saved to $report_file"
    
    # Generate human-readable summary
    cat > "quality-gate-summary.txt" << EOF
Quality Gate Summary for $PROJECT_KEY
=====================================
Status: $status
Date: $(date)
SonarQube Host: $SONAR_HOST

Conditions:
$(echo "$response" | jq -r '.projectStatus.conditions[]? | "- \(.metricKey): \(.actualValue) \(.comparator) \(.errorThreshold) (\(.status))"')

Project URL: $SONAR_HOST/dashboard?id=$PROJECT_KEY
EOF
    
    echo "Quality gate summary saved to quality-gate-summary.txt"
}

# Main execution
main() {
    # Check if required tools are available
    if ! command -v curl &> /dev/null; then
        echo "❌ curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo "❌ jq is required but not installed"
        exit 1
    fi
    
    # Check if SONAR_TOKEN is set
    if [ -z "${SONAR_TOKEN:-}" ]; then
        echo "❌ SONAR_TOKEN environment variable is required"
        exit 1
    fi
    
    # Check SonarQube health
    if ! check_sonarqube_health; then
        exit 1
    fi
    
    # Get the latest analysis task
    echo "Getting latest analysis task..."
    local task_id
    if ! task_id=$(get_latest_task); then
        exit 1
    fi
    
    # Wait for analysis to complete
    if ! wait_for_analysis "$task_id"; then
        exit 1
    fi
    
    # Get quality gate status
    echo "Checking quality gate status..."
    local status
    status=$(get_quality_gate_status)
    
    # Get project metrics
    get_project_metrics
    
    # Generate quality report
    generate_quality_report "$status"
    
    # Check final status
    case $status in
        "OK")
            echo "✅ Quality Gate PASSED"
            exit 0
            ;;
        "ERROR")
            echo "❌ Quality Gate FAILED"
            exit 1
            ;;
        "WARN")
            echo "⚠️  Quality Gate WARNING"
            # You can decide whether to fail on warnings
            if [ "${FAIL_ON_WARNING:-false}" = "true" ]; then
                exit 1
            else
                exit 0
            fi
            ;;
        *)
            echo "❓ Unknown quality gate status: $status"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"