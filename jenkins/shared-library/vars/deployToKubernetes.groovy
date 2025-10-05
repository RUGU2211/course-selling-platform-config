#!/usr/bin/env groovy

/**
 * Deploy to Kubernetes Pipeline Step
 * 
 * This shared library function deploys applications to Kubernetes
 * with environment-specific configurations, health checks, and rollback capabilities.
 * 
 * @param config Map containing:
 *   - serviceName: Name of the service (required)
 *   - environment: Target environment (required)
 *   - imageTag: Docker image tag (required)
 *   - namespace: Kubernetes namespace (default: 'course-platform')
 *   - deploymentFile: Path to deployment YAML (default: auto-detected)
 *   - registry: Docker registry URL (default: env.DOCKER_REGISTRY)
 *   - organization: Organization/namespace (default: env.GITHUB_USERNAME)
 *   - timeout: Deployment timeout in seconds (default: 300)
 *   - runSmokeTests: Whether to run smoke tests (default: true)
 *   - enableRollback: Whether to enable rollback on failure (default: true)
 *   - replicas: Number of replicas (default: auto from deployment file)
 */
def call(Map config) {
    // Validate required parameters
    if (!config.serviceName) {
        error "serviceName is required"
    }
    if (!config.environment) {
        error "environment is required"
    }
    if (!config.imageTag) {
        error "imageTag is required"
    }
    
    // Set defaults
    def serviceName = config.serviceName
    def environment = config.environment
    def imageTag = config.imageTag
    def namespace = config.namespace ?: 'course-platform'
    def registry = config.registry ?: env.DOCKER_REGISTRY ?: 'ghcr.io'
    def organization = config.organization ?: env.GITHUB_USERNAME ?: 'your-org'
    def timeout = config.timeout ?: 300
    def runSmokeTests = config.runSmokeTests != null ? config.runSmokeTests : true
    def enableRollback = config.enableRollback != null ? config.enableRollback : true
    def replicas = config.replicas
    
    // Validate environment
    def validEnvironments = ['development', 'staging', 'production']
    if (!(environment in validEnvironments)) {
        error "Invalid environment: ${environment}. Valid environments: ${validEnvironments.join(', ')}"
    }
    
    // Auto-detect deployment file
    def deploymentFile = config.deploymentFile ?: "k8s/${serviceName}-deployment.yaml"
    
    // Construct full image name
    def fullImageName = "${registry}/${organization}/${serviceName}:${imageTag}"
    
    // Store previous deployment for rollback
    def previousDeployment = null
    
    try {
        stage("Pre-deployment: ${serviceName} to ${environment}") {
            echo "Preparing deployment of ${serviceName} to ${environment}"
            echo "Image: ${fullImageName}"
            echo "Namespace: ${namespace}"
            echo "Deployment file: ${deploymentFile}"
            
            // Verify kubectl connectivity
            sh "kubectl cluster-info"
            
            // Create namespace if it doesn't exist
            sh "kubectl create namespace ${namespace} --dry-run=client -o yaml | kubectl apply -f -"
            
            // Check if deployment file exists
            if (!fileExists(deploymentFile)) {
                error "Deployment file not found: ${deploymentFile}"
            }
            
            // Store current deployment for rollback
            if (enableRollback) {
                try {
                    previousDeployment = sh(
                        script: "kubectl get deployment ${serviceName} -n ${namespace} -o yaml",
                        returnStdout: true
                    ).trim()
                    echo "Stored previous deployment for potential rollback"
                } catch (Exception e) {
                    echo "No previous deployment found (first deployment)"
                }
            }
        }
        
        stage("Deploy: ${serviceName} to ${environment}") {
            echo "Deploying ${serviceName} to ${environment} environment"
            
            // Update image in deployment
            sh """
                kubectl set image deployment/${serviceName} \\
                    ${serviceName}=${fullImageName} \\
                    -n ${namespace}
            """
            
            // Apply deployment configuration
            sh "kubectl apply -f ${deploymentFile} -n ${namespace}"
            
            // Update replicas if specified
            if (replicas) {
                sh "kubectl scale deployment ${serviceName} --replicas=${replicas} -n ${namespace}"
            }
            
            // Add deployment annotations
            sh """
                kubectl annotate deployment ${serviceName} \\
                    deployment.kubernetes.io/revision-history-limit=10 \\
                    deployment.kubernetes.io/deployed-by="jenkins-${env.BUILD_NUMBER}" \\
                    deployment.kubernetes.io/deployed-at="\$(date -u +%Y-%m-%dT%H:%M:%SZ)" \\
                    deployment.kubernetes.io/git-commit="${env.GIT_COMMIT ?: 'unknown'}" \\
                    deployment.kubernetes.io/environment="${environment}" \\
                    -n ${namespace} --overwrite
            """
        }
        
        stage("Wait for Rollout: ${serviceName}") {
            echo "Waiting for rollout to complete..."
            
            def rolloutResult = sh(
                script: "kubectl rollout status deployment/${serviceName} -n ${namespace} --timeout=${timeout}s",
                returnStatus: true
            )
            
            if (rolloutResult != 0) {
                error "Deployment rollout failed or timed out"
            }
            
            echo "✅ Rollout completed successfully"
        }
        
        stage("Verify Deployment: ${serviceName}") {
            echo "Verifying deployment health..."
            
            // Get deployment status
            sh "kubectl get deployment ${serviceName} -n ${namespace} -o wide"
            
            // Get pod status
            sh "kubectl get pods -l app.kubernetes.io/name=${serviceName} -n ${namespace} -o wide"
            
            // Check replica status
            def replicasReady = sh(
                script: "kubectl get deployment ${serviceName} -n ${namespace} -o jsonpath='{.status.readyReplicas}'",
                returnStdout: true
            ).trim()
            
            def replicasDesired = sh(
                script: "kubectl get deployment ${serviceName} -n ${namespace} -o jsonpath='{.spec.replicas}'",
                returnStdout: true
            ).trim()
            
            if (replicasReady != replicasDesired) {
                error "Deployment verification failed: ${replicasReady}/${replicasDesired} replicas ready"
            }
            
            echo "✅ Deployment verification successful: ${replicasReady}/${replicasDesired} replicas ready"
        }
        
        if (runSmokeTests) {
            stage("Smoke Tests: ${serviceName}") {
                echo "Running smoke tests for ${serviceName}"
                
                // Check if smoke test script exists
                def smokeTestScript = "scripts/smoke-test-${serviceName}.sh"
                if (fileExists(smokeTestScript)) {
                    sh "chmod +x ${smokeTestScript}"
                    sh "${smokeTestScript} ${environment} ${namespace}"
                } else {
                    echo "No smoke test script found at ${smokeTestScript}"
                    
                    // Basic connectivity test
                    def serviceExists = sh(
                        script: "kubectl get service ${serviceName} -n ${namespace}",
                        returnStatus: true
                    )
                    
                    if (serviceExists == 0) {
                        echo "✅ Service ${serviceName} is accessible"
                    } else {
                        echo "⚠️  Service ${serviceName} not found, skipping connectivity test"
                    }
                }
            }
        }
        
        stage("Post-deployment: ${serviceName}") {
            echo "Post-deployment tasks for ${serviceName}"
            
            // Get service endpoints
            try {
                def endpoints = sh(
                    script: "kubectl get endpoints ${serviceName} -n ${namespace} -o jsonpath='{.subsets[*].addresses[*].ip}'",
                    returnStdout: true
                ).trim()
                
                if (endpoints) {
                    echo "Service endpoints: ${endpoints}"
                } else {
                    echo "No endpoints found for service ${serviceName}"
                }
            } catch (Exception e) {
                echo "Could not retrieve service endpoints: ${e.getMessage()}"
            }
            
            // Display recent events
            sh "kubectl get events -n ${namespace} --sort-by='.lastTimestamp' | tail -10"
            
            // Update deployment status in external systems (if configured)
            if (env.SLACK_WEBHOOK_URL) {
                def message = """
                🚀 *Deployment Successful*
                Service: `${serviceName}`
                Environment: `${environment}`
                Image: `${fullImageName}`
                Namespace: `${namespace}`
                Build: `${env.BUILD_NUMBER}`
                Commit: `${env.GIT_COMMIT?.take(8) ?: 'unknown'}`
                """.stripIndent()
                
                sh """
                    curl -X POST -H 'Content-type: application/json' \\
                        --data '{"text":"${message}"}' \\
                        ${env.SLACK_WEBHOOK_URL}
                """
            }
        }
        
        echo "✅ Deployment of ${serviceName} to ${environment} completed successfully"
        
    } catch (Exception e) {
        echo "❌ Deployment failed: ${e.getMessage()}"
        
        if (enableRollback && previousDeployment) {
            stage("Rollback: ${serviceName}") {
                echo "Rolling back ${serviceName} deployment..."
                
                try {
                    // Rollback to previous deployment
                    sh "kubectl rollout undo deployment/${serviceName} -n ${namespace}"
                    
                    // Wait for rollback to complete
                    sh "kubectl rollout status deployment/${serviceName} -n ${namespace} --timeout=180s"
                    
                    echo "✅ Rollback completed successfully"
                    
                    // Notify about rollback
                    if (env.SLACK_WEBHOOK_URL) {
                        def rollbackMessage = """
                        ⚠️ *Deployment Rolled Back*
                        Service: `${serviceName}`
                        Environment: `${environment}`
                        Reason: Deployment failure
                        Build: `${env.BUILD_NUMBER}`
                        """.stripIndent()
                        
                        sh """
                            curl -X POST -H 'Content-type: application/json' \\
                                --data '{"text":"${rollbackMessage}"}' \\
                                ${env.SLACK_WEBHOOK_URL}
                        """
                    }
                } catch (Exception rollbackError) {
                    echo "❌ Rollback also failed: ${rollbackError.getMessage()}"
                }
            }
        }
        
        throw e
    }
}