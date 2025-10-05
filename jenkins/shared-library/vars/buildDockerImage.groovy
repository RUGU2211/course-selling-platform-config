#!/usr/bin/env groovy

/**
 * Build Docker Image Pipeline Step
 * 
 * This shared library function builds Docker images with standardized
 * tagging, security scanning, and registry push capabilities.
 * 
 * @param config Map containing:
 *   - serviceName: Name of the service (required)
 *   - dockerfilePath: Path to Dockerfile (default: 'Dockerfile')
 *   - buildContext: Build context path (default: '.')
 *   - registry: Docker registry URL (default: env.DOCKER_REGISTRY)
 *   - organization: Organization/namespace (default: env.GITHUB_USERNAME)
 *   - tags: List of additional tags (default: [])
 *   - pushToRegistry: Whether to push to registry (default: true)
 *   - runSecurityScan: Whether to run security scan (default: true)
 *   - buildArgs: Map of build arguments (default: [:])
 */
def call(Map config) {
    // Validate required parameters
    if (!config.serviceName) {
        error "serviceName is required"
    }
    
    // Set defaults
    def serviceName = config.serviceName
    def dockerfilePath = config.dockerfilePath ?: 'Dockerfile'
    def buildContext = config.buildContext ?: '.'
    def registry = config.registry ?: env.DOCKER_REGISTRY ?: 'ghcr.io'
    def organization = config.organization ?: env.GITHUB_USERNAME ?: 'your-org'
    def tags = config.tags ?: []
    def pushToRegistry = config.pushToRegistry != null ? config.pushToRegistry : true
    def runSecurityScan = config.runSecurityScan != null ? config.runSecurityScan : true
    def buildArgs = config.buildArgs ?: [:]
    
    // Generate image name and tags
    def baseImageName = "${registry}/${organization}/${serviceName}"
    def gitCommit = env.GIT_COMMIT?.take(8) ?: 'latest'
    def buildNumber = env.BUILD_NUMBER ?: 'local'
    def branchName = env.BRANCH_NAME?.replaceAll('/', '-') ?: 'main'
    
    // Default tags
    def imageTags = [
        "${baseImageName}:${gitCommit}",
        "${baseImageName}:build-${buildNumber}",
        "${baseImageName}:${branchName}-latest"
    ]
    
    // Add latest tag for main/master branch
    if (branchName in ['main', 'master']) {
        imageTags.add("${baseImageName}:latest")
    }
    
    // Add custom tags
    tags.each { tag ->
        imageTags.add("${baseImageName}:${tag}")
    }
    
    // Build arguments
    def buildArgsString = ""
    buildArgs.each { key, value ->
        buildArgsString += "--build-arg ${key}=${value} "
    }
    
    // Add standard build arguments
    buildArgsString += "--build-arg BUILD_DATE=${new Date().format('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'')} "
    buildArgsString += "--build-arg VCS_REF=${gitCommit} "
    buildArgsString += "--build-arg BUILD_NUMBER=${buildNumber} "
    
    try {
        stage("Build Docker Image: ${serviceName}") {
            echo "Building Docker image for ${serviceName}"
            echo "Dockerfile: ${dockerfilePath}"
            echo "Build context: ${buildContext}"
            echo "Tags: ${imageTags.join(', ')}"
            
            // Build the image with the first tag
            def primaryTag = imageTags[0]
            sh """
                cd ${buildContext}
                docker build \\
                    -f ${dockerfilePath} \\
                    ${buildArgsString} \\
                    --label org.opencontainers.image.title="${serviceName}" \\
                    --label org.opencontainers.image.description="Course Platform ${serviceName}" \\
                    --label org.opencontainers.image.version="${gitCommit}" \\
                    --label org.opencontainers.image.revision="${gitCommit}" \\
                    --label org.opencontainers.image.created="${new Date().format('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'')}" \\
                    --label org.opencontainers.image.source="${env.GIT_URL ?: ''}" \\
                    --label org.opencontainers.image.vendor="Course Platform" \\
                    -t ${primaryTag} \\
                    .
            """
            
            // Tag with additional tags
            imageTags.drop(1).each { tag ->
                sh "docker tag ${primaryTag} ${tag}"
            }
            
            // Display image information
            sh "docker images ${baseImageName}"
            sh "docker inspect ${primaryTag} | jq '.[0].Config.Labels'"
        }
        
        if (runSecurityScan) {
            stage("Security Scan: ${serviceName}") {
                echo "Running security scan on ${serviceName} image"
                
                // Run Trivy scan
                sh """
                    trivy image \\
                        --exit-code 0 \\
                        --severity HIGH,CRITICAL \\
                        --format json \\
                        --output trivy-report-${serviceName}.json \\
                        ${imageTags[0]}
                """
                
                // Archive security report
                archiveArtifacts artifacts: "trivy-report-${serviceName}.json", allowEmptyArchive: true
                
                // Run Snyk scan if token is available
                if (env.SNYK_TOKEN) {
                    sh """
                        snyk container test \\
                            --severity-threshold=high \\
                            --json \\
                            --json-file-output=snyk-report-${serviceName}.json \\
                            ${imageTags[0]} || true
                    """
                    archiveArtifacts artifacts: "snyk-report-${serviceName}.json", allowEmptyArchive: true
                }
            }
        }
        
        if (pushToRegistry) {
            stage("Push to Registry: ${serviceName}") {
                echo "Pushing ${serviceName} image to registry"
                
                // Login to registry if credentials are available
                withCredentials([usernamePassword(
                    credentialsId: 'docker-registry-credentials',
                    usernameVariable: 'REGISTRY_USERNAME',
                    passwordVariable: 'REGISTRY_PASSWORD'
                )]) {
                    sh "echo \$REGISTRY_PASSWORD | docker login ${registry} -u \$REGISTRY_USERNAME --password-stdin"
                }
                
                // Push all tags
                imageTags.each { tag ->
                    sh "docker push ${tag}"
                    echo "✅ Pushed: ${tag}"
                }
                
                // Logout from registry
                sh "docker logout ${registry}"
            }
        }
        
        // Clean up local images to save space
        stage("Cleanup: ${serviceName}") {
            echo "Cleaning up local images for ${serviceName}"
            
            // Keep the latest tag, remove others
            def tagsToRemove = imageTags.drop(1)
            tagsToRemove.each { tag ->
                sh "docker rmi ${tag} || true"
            }
        }
        
        // Return the primary image tag for use in deployment
        return imageTags[0]
        
    } catch (Exception e) {
        echo "❌ Failed to build Docker image for ${serviceName}: ${e.getMessage()}"
        throw e
    }
}