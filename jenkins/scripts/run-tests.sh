#!/bin/bash

# Run Tests Script for Jenkins Pipeline
# Usage: ./run-tests.sh <test-type> <service-path> [additional-args]

set -euo pipefail

TEST_TYPE=${1:-""}
SERVICE_PATH=${2:-"."}
ADDITIONAL_ARGS=${3:-""}

if [ -z "$TEST_TYPE" ]; then
    echo "Error: Test type is required"
    echo "Usage: $0 <test-type> [service-path] [additional-args]"
    echo "Test types: unit, integration, e2e, security, performance"
    exit 1
fi

echo "Running $TEST_TYPE tests in $SERVICE_PATH"
cd "$SERVICE_PATH"

# Function to run Maven tests
run_maven_tests() {
    local test_profile=$1
    echo "Running Maven tests with profile: $test_profile"
    
    mvn clean test \
        -P"$test_profile" \
        -Dmaven.test.failure.ignore=false \
        -Dsurefire.useFile=false \
        -Djacoco.destFile=target/jacoco.exec \
        $ADDITIONAL_ARGS
}

# Function to run npm tests
run_npm_tests() {
    local test_command=$1
    echo "Running npm tests: $test_command"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "Installing npm dependencies..."
        npm ci
    fi
    
    # Run the test command
    npm run "$test_command" $ADDITIONAL_ARGS
}

# Function to run security tests
run_security_tests() {
    echo "Running security tests..."
    
    # Check if it's a Java project
    if [ -f "pom.xml" ]; then
        echo "Running OWASP Dependency Check for Java project..."
        mvn org.owasp:dependency-check-maven:check
        
        # Run Snyk if available
        if command -v snyk &> /dev/null; then
            echo "Running Snyk security scan..."
            snyk test --severity-threshold=high
        fi
    fi
    
    # Check if it's a Node.js project
    if [ -f "package.json" ]; then
        echo "Running npm audit..."
        npm audit --audit-level=high
        
        # Run Snyk if available
        if command -v snyk &> /dev/null; then
            echo "Running Snyk security scan..."
            snyk test --severity-threshold=high
        fi
    fi
    
    # Run Trivy filesystem scan if available
    if command -v trivy &> /dev/null; then
        echo "Running Trivy filesystem scan..."
        trivy fs --exit-code 0 --severity HIGH,CRITICAL .
    fi
}

# Function to run performance tests
run_performance_tests() {
    echo "Running performance tests..."
    
    # Check for k6 performance tests
    if [ -d "performance-tests" ] && command -v k6 &> /dev/null; then
        echo "Running k6 performance tests..."
        for test_file in performance-tests/*.js; do
            if [ -f "$test_file" ]; then
                echo "Running $test_file..."
                k6 run "$test_file"
            fi
        done
    fi
    
    # Check for JMeter tests
    if [ -d "jmeter-tests" ] && command -v jmeter &> /dev/null; then
        echo "Running JMeter performance tests..."
        for test_file in jmeter-tests/*.jmx; do
            if [ -f "$test_file" ]; then
                echo "Running $test_file..."
                jmeter -n -t "$test_file" -l results.jtl
            fi
        done
    fi
    
    # Frontend performance tests with Lighthouse
    if [ -f "package.json" ] && command -v lhci &> /dev/null; then
        echo "Running Lighthouse CI performance tests..."
        lhci autorun
    fi
}

# Main test execution logic
case $TEST_TYPE in
    unit)
        if [ -f "pom.xml" ]; then
            run_maven_tests "unit-tests"
        elif [ -f "package.json" ]; then
            run_npm_tests "test:unit"
        else
            echo "Error: No recognized project structure found"
            exit 1
        fi
        ;;
    
    integration)
        if [ -f "pom.xml" ]; then
            run_maven_tests "integration-tests"
        elif [ -f "package.json" ]; then
            run_npm_tests "test:integration"
        else
            echo "Error: No recognized project structure found"
            exit 1
        fi
        ;;
    
    e2e)
        if [ -f "pom.xml" ]; then
            run_maven_tests "e2e-tests"
        elif [ -f "package.json" ]; then
            run_npm_tests "test:e2e"
        else
            echo "Error: No recognized project structure found"
            exit 1
        fi
        ;;
    
    security)
        run_security_tests
        ;;
    
    performance)
        run_performance_tests
        ;;
    
    all)
        echo "Running all test types..."
        
        # Run unit tests
        if [ -f "pom.xml" ]; then
            run_maven_tests "unit-tests"
        elif [ -f "package.json" ]; then
            run_npm_tests "test:unit"
        fi
        
        # Run integration tests
        if [ -f "pom.xml" ]; then
            run_maven_tests "integration-tests"
        elif [ -f "package.json" ]; then
            run_npm_tests "test:integration"
        fi
        
        # Run security tests
        run_security_tests
        ;;
    
    *)
        echo "Error: Invalid test type. Use: unit, integration, e2e, security, performance, or all"
        exit 1
        ;;
esac

# Generate test reports
echo "Generating test reports..."

# Java projects - copy test results
if [ -f "pom.xml" ]; then
    # Copy Surefire reports
    if [ -d "target/surefire-reports" ]; then
        mkdir -p test-results/junit
        cp target/surefire-reports/*.xml test-results/junit/ 2>/dev/null || true
    fi
    
    # Copy Failsafe reports
    if [ -d "target/failsafe-reports" ]; then
        mkdir -p test-results/junit
        cp target/failsafe-reports/*.xml test-results/junit/ 2>/dev/null || true
    fi
    
    # Copy JaCoCo coverage reports
    if [ -f "target/site/jacoco/jacoco.xml" ]; then
        mkdir -p test-results/coverage
        cp target/site/jacoco/jacoco.xml test-results/coverage/
    fi
fi

# Node.js projects - copy test results
if [ -f "package.json" ]; then
    # Copy Jest/Vitest reports
    if [ -d "coverage" ]; then
        mkdir -p test-results/coverage
        cp -r coverage/* test-results/coverage/ 2>/dev/null || true
    fi
    
    # Copy test results
    if [ -f "test-results.xml" ]; then
        mkdir -p test-results/junit
        cp test-results.xml test-results/junit/
    fi
fi

echo "✅ $TEST_TYPE tests completed successfully!"