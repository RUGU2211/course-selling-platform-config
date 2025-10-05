# Jenkins Shared Library for Course Platform

This shared library provides reusable pipeline components for the Course Platform CI/CD workflows.

## Overview

The shared library contains standardized functions for common CI/CD operations including:

- Docker image building and management
- Kubernetes deployments with health checks
- Test execution across multiple project types
- SonarQube code analysis and quality gates
- Slack notifications with rich formatting

## Functions

### buildDockerImage

Builds Docker images with standardized tagging, security scanning, and registry operations.

```groovy
buildDockerImage([
    serviceName: 'frontend',
    dockerfilePath: 'Dockerfile',
    buildContext: '.',
    registry: 'ghcr.io',
    organization: 'your-org',
    tags: ['v1.0.0'],
    pushToRegistry: true,
    runSecurityScan: true,
    buildArgs: [
        NODE_ENV: 'production'
    ]
])
```

**Parameters:**
- `serviceName` (required): Name of the service
- `dockerfilePath`: Path to Dockerfile (default: 'Dockerfile')
- `buildContext`: Build context path (default: '.')
- `registry`: Docker registry URL (default: env.DOCKER_REGISTRY)
- `organization`: Organization/namespace (default: env.GITHUB_USERNAME)
- `tags`: List of additional tags (default: [])
- `pushToRegistry`: Whether to push to registry (default: true)
- `runSecurityScan`: Whether to run security scan (default: true)
- `buildArgs`: Map of build arguments (default: [:])

### deployToKubernetes

Deploys applications to Kubernetes with environment-specific configurations and health checks.

```groovy
deployToKubernetes([
    serviceName: 'frontend',
    environment: 'production',
    imageTag: 'v1.0.0',
    namespace: 'course-platform',
    timeout: 300,
    runSmokeTests: true,
    enableRollback: true
])
```

**Parameters:**
- `serviceName` (required): Name of the service
- `environment` (required): Target environment (development, staging, production)
- `imageTag` (required): Docker image tag
- `namespace`: Kubernetes namespace (default: 'course-platform')
- `deploymentFile`: Path to deployment YAML (default: auto-detected)
- `timeout`: Deployment timeout in seconds (default: 300)
- `runSmokeTests`: Whether to run smoke tests (default: true)
- `enableRollback`: Whether to enable rollback on failure (default: true)
- `replicas`: Number of replicas (default: auto from deployment file)

### runTests

Executes various types of tests with proper reporting and coverage analysis.

```groovy
runTests([
    testType: 'unit',
    servicePath: './frontend',
    projectType: 'npm',
    coverageThreshold: 80,
    publishResults: true,
    parallelExecution: false
])
```

**Parameters:**
- `testType` (required): Type of tests (unit, integration, e2e, security, performance, all)
- `servicePath`: Path to the service directory (default: '.')
- `projectType`: Project type (default: auto-detected) - maven, gradle, npm, python
- `testCommand`: Custom test command (optional)
- `coverageThreshold`: Minimum coverage percentage (default: 80)
- `failOnCoverageThreshold`: Fail if coverage below threshold (default: false)
- `publishResults`: Whether to publish test results (default: true)
- `archiveArtifacts`: Whether to archive test artifacts (default: true)
- `parallelExecution`: Whether to run tests in parallel (default: false)

### sonarQubeAnalysis

Performs SonarQube code analysis with quality gate checking.

```groovy
sonarQubeAnalysis([
    projectKey: 'course-platform-frontend',
    projectName: 'Course Platform Frontend',
    projectVersion: '1.0.0',
    qualityGate: true,
    failOnQualityGate: true,
    timeout: 300
])
```

**Parameters:**
- `projectKey` (required): SonarQube project key
- `projectName`: SonarQube project name (default: projectKey)
- `projectVersion`: Project version (default: env.BUILD_NUMBER)
- `sources`: Source directories (default: auto-detected)
- `language`: Programming language (default: auto-detected)
- `qualityGate`: Whether to check quality gate (default: true)
- `timeout`: Quality gate timeout in seconds (default: 300)
- `failOnQualityGate`: Whether to fail on quality gate failure (default: true)
- `excludePatterns`: Patterns to exclude from analysis (default: auto)
- `coverageReports`: Coverage report paths (default: auto-detected)

### notifySlack

Sends notifications to Slack with customizable messages and formatting.

```groovy
notifySlack([
    message: 'Deployment completed successfully!',
    channel: '#deployments',
    status: 'SUCCESS',
    includeDetails: true,
    mentionUsers: ['@devops-team']
])
```

**Parameters:**
- `message` (required): Main message text
- `channel`: Slack channel (default: env.SLACK_CHANNEL or '#ci-cd')
- `color`: Message color (default: auto based on status)
- `status`: Build status (default: auto-detected)
- `includeDetails`: Whether to include build details (default: true)
- `mentionUsers`: List of users to mention (default: [])
- `customFields`: Additional fields to include (default: [])

**Convenience Methods:**
```groovy
notifySlack.success('Build completed!')
notifySlack.failure('Build failed!')
notifySlack.warning('Build unstable!')
notifySlack.info('Build information')
notifySlack.started('Build started')
```

## Usage Examples

### Complete Pipeline Example

```groovy
@Library('course-platform-shared-library') _

pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'ghcr.io'
        GITHUB_USERNAME = 'your-org'
        SONAR_HOST_URL = 'http://sonarqube:9000'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                notifySlack.started("Build started for ${env.JOB_NAME}")
            }
        }
        
        stage('Test') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        runTests([
                            testType: 'unit',
                            servicePath: './frontend',
                            coverageThreshold: 80
                        ])
                    }
                }
                stage('Backend Tests') {
                    steps {
                        runTests([
                            testType: 'unit',
                            servicePath: './api-gateway',
                            coverageThreshold: 75
                        ])
                    }
                }
            }
        }
        
        stage('Code Analysis') {
            parallel {
                stage('Frontend Analysis') {
                    steps {
                        sonarQubeAnalysis([
                            projectKey: 'course-platform-frontend',
                            servicePath: './frontend'
                        ])
                    }
                }
                stage('Backend Analysis') {
                    steps {
                        sonarQubeAnalysis([
                            projectKey: 'course-platform-api-gateway',
                            servicePath: './api-gateway'
                        ])
                    }
                }
            }
        }
        
        stage('Build Images') {
            parallel {
                stage('Frontend Image') {
                    steps {
                        script {
                            def imageTag = buildDockerImage([
                                serviceName: 'frontend',
                                buildContext: './frontend'
                            ])
                            env.FRONTEND_IMAGE_TAG = imageTag
                        }
                    }
                }
                stage('API Gateway Image') {
                    steps {
                        script {
                            def imageTag = buildDockerImage([
                                serviceName: 'api-gateway',
                                buildContext: './api-gateway'
                            ])
                            env.API_GATEWAY_IMAGE_TAG = imageTag
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            parallel {
                stage('Deploy Frontend') {
                    steps {
                        deployToKubernetes([
                            serviceName: 'frontend',
                            environment: 'staging',
                            imageTag: env.FRONTEND_IMAGE_TAG
                        ])
                    }
                }
                stage('Deploy API Gateway') {
                    steps {
                        deployToKubernetes([
                            serviceName: 'api-gateway',
                            environment: 'staging',
                            imageTag: env.API_GATEWAY_IMAGE_TAG
                        ])
                    }
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                
                parallel {
                    stage('Deploy Frontend') {
                        steps {
                            deployToKubernetes([
                                serviceName: 'frontend',
                                environment: 'production',
                                imageTag: env.FRONTEND_IMAGE_TAG,
                                replicas: 3
                            ])
                        }
                    }
                    stage('Deploy API Gateway') {
                        steps {
                            deployToKubernetes([
                                serviceName: 'api-gateway',
                                environment: 'production',
                                imageTag: env.API_GATEWAY_IMAGE_TAG,
                                replicas: 2
                            ])
                        }
                    }
                }
            }
        }
    }
    
    post {
        success {
            notifySlack.success("✅ Build completed successfully!")
        }
        failure {
            notifySlack.failure("❌ Build failed!")
        }
        unstable {
            notifySlack.warning("⚠️ Build unstable!")
        }
        always {
            cleanWs()
        }
    }
}
```

### Service-Specific Pipeline

```groovy
@Library('course-platform-shared-library') _

pipeline {
    agent any
    
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['development', 'staging', 'production'],
            description: 'Target environment'
        )
        booleanParam(
            name: 'RUN_SECURITY_SCAN',
            defaultValue: true,
            description: 'Run security scan'
        )
    }
    
    stages {
        stage('Build and Test') {
            steps {
                // Run tests
                runTests([
                    testType: 'all',
                    parallelExecution: true
                ])
                
                // Code analysis
                sonarQubeAnalysis([
                    projectKey: "course-platform-${env.JOB_BASE_NAME}",
                    failOnQualityGate: params.ENVIRONMENT == 'production'
                ])
                
                // Build image
                script {
                    def imageTag = buildDockerImage([
                        serviceName: env.JOB_BASE_NAME,
                        runSecurityScan: params.RUN_SECURITY_SCAN
                    ])
                    
                    // Deploy
                    deployToKubernetes([
                        serviceName: env.JOB_BASE_NAME,
                        environment: params.ENVIRONMENT,
                        imageTag: imageTag
                    ])
                }
            }
        }
    }
}
```

## Configuration

### Environment Variables

The shared library uses the following environment variables:

- `DOCKER_REGISTRY`: Docker registry URL
- `GITHUB_USERNAME`: GitHub username/organization
- `SONAR_HOST_URL`: SonarQube server URL
- `SONAR_TOKEN`: SonarQube authentication token
- `SLACK_WEBHOOK_URL`: Slack webhook URL for notifications
- `SLACK_CHANNEL`: Default Slack channel

### Jenkins Configuration

1. **Global Shared Library**: Configure in Jenkins Global Configuration
   - Name: `course-platform-shared-library`
   - Default version: `main`
   - Retrieval method: Modern SCM
   - Source Code Management: Git
   - Repository URL: Your repository URL

2. **Credentials**: Configure the following credentials in Jenkins:
   - `docker-registry-credentials`: Docker registry username/password
   - `sonarqube-token`: SonarQube authentication token
   - `slack-webhook-url`: Slack webhook URL

3. **Tools**: Configure the following tools:
   - Docker
   - kubectl
   - SonarQube Scanner
   - Maven/Gradle/Node.js (as needed)

## Best Practices

1. **Error Handling**: All functions include comprehensive error handling and cleanup
2. **Logging**: Detailed logging for debugging and monitoring
3. **Security**: Security scanning integrated into build process
4. **Rollback**: Automatic rollback capabilities for failed deployments
5. **Notifications**: Rich notifications with build details and links
6. **Parallel Execution**: Support for parallel test and build execution
7. **Environment Isolation**: Environment-specific configurations and validations

## Contributing

When adding new functions to the shared library:

1. Follow the existing naming conventions
2. Include comprehensive parameter validation
3. Add detailed documentation and examples
4. Include error handling and cleanup
5. Add logging for debugging
6. Test with different project types and scenarios

## Support

For issues or questions about the shared library:

1. Check the Jenkins build logs for detailed error messages
2. Verify environment variables and credentials are configured
3. Ensure required tools are installed on Jenkins agents
4. Review the function documentation and examples