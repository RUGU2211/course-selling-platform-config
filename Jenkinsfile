#!/usr/bin/env groovy

pipeline {
    agent any
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
        skipDefaultCheckout()
        parallelsAlwaysFailFast()
    }
    
    environment {
        // Docker Registry Configuration
        DOCKER_REGISTRY = 'ghcr.io'
        DOCKER_NAMESPACE = 'course-platform'
        
        // Application Configuration
        APP_NAME = 'course-selling-platform'
        
        // Kubernetes Configuration
        KUBECONFIG = credentials('kubeconfig')
        
        // SonarQube Configuration
        SONAR_TOKEN = credentials('sonar-token')
        
        // Notification Configuration
        SLACK_CHANNEL = '#deployments'
        SLACK_WEBHOOK = credentials('slack-webhook')
        
        // Security Scanning
        SNYK_TOKEN = credentials('snyk-token')
        
        // Build Information
        BUILD_VERSION = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
        BUILD_TIMESTAMP = new Date().format('yyyy-MM-dd-HH-mm-ss')
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    // Clean workspace and checkout code
                    cleanWs()
                    checkout scm
                    
                    // Set build display name
                    currentBuild.displayName = "#${env.BUILD_NUMBER} - ${env.GIT_BRANCH}"
                    currentBuild.description = "Build ${env.BUILD_VERSION}"
                }
            }
        }
        
        stage('Pre-build Analysis') {
            parallel {
                stage('Code Quality - Backend') {
                    steps {
                        script {
                            def services = [
                                'user-management-service',
                                'course-management-service',
                                'enrollmentservice',
                                'payment',
                                'notification-service',
                                'content-delivery-service',
                                'api-gateway',
                                'config-server',
                                'eureka-server'
                            ]
                            
                            services.each { service ->
                                dir(service) {
                                    sh """
                                        if [ -f pom.xml ]; then
                                            mvn clean compile
                                            mvn spotbugs:check
                                            mvn checkstyle:check
                                        fi
                                    """
                                }
                            }
                        }
                    }
                }
                
                stage('Code Quality - Frontend') {
                    steps {
                        dir('frontend') {
                            sh '''
                                npm ci
                                npm run lint
                                npm run type-check
                            '''
                        }
                    }
                }
                
                stage('Security Scan') {
                    steps {
                        script {
                            // Dependency vulnerability scanning
                            sh '''
                                # Install Snyk CLI
                                npm install -g snyk
                                
                                # Authenticate with Snyk
                                snyk auth $SNYK_TOKEN
                                
                                # Scan frontend dependencies
                                cd frontend
                                snyk test --severity-threshold=high
                                
                                # Scan backend dependencies
                                cd ../
                                find . -name "pom.xml" -not -path "./target/*" | while read pom; do
                                    dir=$(dirname "$pom")
                                    echo "Scanning $dir"
                                    cd "$dir"
                                    snyk test --severity-threshold=high
                                    cd - > /dev/null
                                done
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        script {
                            def services = [
                                'user-management-service',
                                'course-management-service',
                                'enrollmentservice',
                                'payment',
                                'notification-service',
                                'content-delivery-service',
                                'api-gateway',
                                'config-server',
                                'eureka-server'
                            ]
                            
                            services.each { service ->
                                dir(service) {
                                    sh """
                                        if [ -f pom.xml ]; then
                                            mvn test
                                            mvn jacoco:report
                                        fi
                                    """
                                }
                            }
                        }
                    }
                    post {
                        always {
                            // Collect test results
                            publishTestResults testResultsPattern: '**/target/surefire-reports/*.xml'
                            
                            // Collect coverage reports
                            publishCoverage adapters: [
                                jacocoAdapter('**/target/site/jacoco/jacoco.xml')
                            ], sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
                        }
                    }
                }
                
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh '''
                                npm run test:coverage
                            '''
                        }
                    }
                    post {
                        always {
                            // Publish frontend test results
                            publishTestResults testResultsPattern: 'frontend/coverage/junit.xml'
                            
                            // Publish frontend coverage
                            publishCoverage adapters: [
                                coberturaAdapter('frontend/coverage/cobertura-coverage.xml')
                            ], sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
                        }
                    }
                }
            }
        }
        
        stage('SonarQube Analysis') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    changeRequest()
                }
            }
            steps {
                script {
                    withSonarQubeEnv('SonarQube') {
                        // Backend analysis
                        sh '''
                            mvn sonar:sonar \
                                -Dsonar.projectKey=course-selling-platform \
                                -Dsonar.projectName="Course Selling Platform" \
                                -Dsonar.projectVersion=${BUILD_VERSION} \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions=**/target/**,**/node_modules/**,**/dist/**
                        '''
                        
                        // Frontend analysis
                        dir('frontend') {
                            sh '''
                                npx sonar-scanner \
                                    -Dsonar.projectKey=course-selling-platform-frontend \
                                    -Dsonar.projectName="Course Selling Platform Frontend" \
                                    -Dsonar.projectVersion=${BUILD_VERSION} \
                                    -Dsonar.sources=src \
                                    -Dsonar.exclusions=**/*.test.ts,**/*.test.tsx,**/node_modules/**,**/dist/** \
                                    -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    changeRequest()
                }
            }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Build Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            parallel {
                stage('Build Backend Services') {
                    steps {
                        script {
                            def services = [
                                'user-management-service',
                                'course-management-service',
                                'enrollmentservice',
                                'payment',
                                'notification-service',
                                'content-delivery-service',
                                'api-gateway',
                                'config-server',
                                'eureka-server'
                            ]
                            
                            services.each { service ->
                                dir(service) {
                                    sh """
                                        # Build JAR
                                        mvn clean package -DskipTests
                                        
                                        # Build Docker image
                                        docker build -t ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${service}:${BUILD_VERSION} .
                                        docker tag ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${service}:${BUILD_VERSION} ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${service}:latest
                                    """
                                }
                            }
                        }
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh """
                                # Build React application
                                npm run build
                                
                                # Build Docker image
                                docker build -t ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/frontend:${BUILD_VERSION} .
                                docker tag ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/frontend:${BUILD_VERSION} ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/frontend:latest
                            """
                        }
                    }
                }
            }
        }
        
        stage('Security Scan Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def images = [
                        'frontend',
                        'user-management-service',
                        'course-management-service',
                        'enrollmentservice',
                        'payment',
                        'notification-service',
                        'content-delivery-service',
                        'api-gateway',
                        'config-server',
                        'eureka-server'
                    ]
                    
                    images.each { image ->
                        sh """
                            # Scan with Trivy
                            trivy image --exit-code 1 --severity HIGH,CRITICAL ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${image}:${BUILD_VERSION}
                            
                            # Scan with Snyk
                            snyk container test ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${image}:${BUILD_VERSION} --severity-threshold=high
                        """
                    }
                }
            }
        }
        
        stage('Push Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-registry', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            echo $DOCKER_PASS | docker login $DOCKER_REGISTRY -u $DOCKER_USER --password-stdin
                        '''
                        
                        def images = [
                            'frontend',
                            'user-management-service',
                            'course-management-service',
                            'enrollmentservice',
                            'payment',
                            'notification-service',
                            'content-delivery-service',
                            'api-gateway',
                            'config-server',
                            'eureka-server'
                        ]
                        
                        images.each { image ->
                            sh """
                                docker push ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${image}:${BUILD_VERSION}
                                docker push ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${image}:latest
                            """
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    deployToEnvironment('development', BUILD_VERSION)
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                script {
                    deployToEnvironment('staging', BUILD_VERSION)
                }
            }
        }
        
        stage('Integration Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def environment = env.BRANCH_NAME == 'main' ? 'staging' : 'development'
                    
                    sh """
                        # Wait for deployment to be ready
                        kubectl wait --for=condition=available --timeout=300s deployment/frontend -n ${environment}
                        kubectl wait --for=condition=available --timeout=300s deployment/api-gateway -n ${environment}
                        
                        # Run integration tests
                        cd frontend
                        npm run test:e2e:${environment}
                    """
                }
            }
        }
        
        stage('Performance Tests') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sh '''
                        # Install k6
                        curl -s https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz | tar xz
                        sudo mv k6-v0.47.0-linux-amd64/k6 /usr/local/bin/
                        
                        # Run performance tests
                        k6 run --out influxdb=http://influxdb:8086/k6 performance-tests/load-test.js
                    '''
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                allOf {
                    branch 'main'
                    expression { return currentBuild.result == null || currentBuild.result == 'SUCCESS' }
                }
            }
            steps {
                script {
                    // Manual approval for production deployment
                    timeout(time: 5, unit: 'MINUTES') {
                        input message: 'Deploy to Production?', ok: 'Deploy',
                              submitterParameter: 'DEPLOYER'
                    }
                    
                    deployToEnvironment('production', BUILD_VERSION)
                }
            }
        }
        
        stage('Production Smoke Tests') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sh '''
                        # Wait for production deployment
                        kubectl wait --for=condition=available --timeout=600s deployment/frontend -n production
                        kubectl wait --for=condition=available --timeout=600s deployment/api-gateway -n production
                        
                        # Run smoke tests
                        curl -f https://course-platform.com/health || exit 1
                        curl -f https://course-platform.com/api/health || exit 1
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Clean up Docker images
            sh '''
                docker system prune -f
                docker image prune -f
            '''
            
            // Archive artifacts
            archiveArtifacts artifacts: '**/target/*.jar,frontend/dist/**', allowEmptyArchive: true
            
            // Clean workspace
            cleanWs()
        }
        
        success {
            script {
                if (env.BRANCH_NAME == 'main') {
                    slackSend(
                        channel: env.SLACK_CHANNEL,
                        color: 'good',
                        message: ":white_check_mark: *SUCCESS* - Course Selling Platform deployed to production\\n" +
                                "Build: ${env.BUILD_NUMBER}\\n" +
                                "Version: ${BUILD_VERSION}\\n" +
                                "Deployer: ${env.DEPLOYER ?: 'Automated'}\\n" +
                                "Duration: ${currentBuild.durationString}"
                    )
                }
            }
        }
        
        failure {
            slackSend(
                channel: env.SLACK_CHANNEL,
                color: 'danger',
                message: ":x: *FAILED* - Course Selling Platform build failed\\n" +
                        "Build: ${env.BUILD_NUMBER}\\n" +
                        "Branch: ${env.BRANCH_NAME}\\n" +
                        "Stage: ${env.STAGE_NAME}\\n" +
                        "Duration: ${currentBuild.durationString}"
            )
        }
        
        unstable {
            slackSend(
                channel: env.SLACK_CHANNEL,
                color: 'warning',
                message: ":warning: *UNSTABLE* - Course Selling Platform build is unstable\\n" +
                        "Build: ${env.BUILD_NUMBER}\\n" +
                        "Branch: ${env.BRANCH_NAME}\\n" +
                        "Duration: ${currentBuild.durationString}"
            )
        }
    }
}

// Helper function for deployment
def deployToEnvironment(environment, version) {
    sh """
        # Update image tags in Kubernetes manifests
        find k8s/ -name "*.yaml" -exec sed -i 's|IMAGE_TAG|${version}|g' {} \\;
        
        # Apply Kubernetes manifests
        kubectl apply -f k8s/namespace.yaml
        kubectl apply -f k8s/ -n ${environment}
        
        # Wait for rollout to complete
        kubectl rollout status deployment/frontend -n ${environment} --timeout=300s
        kubectl rollout status deployment/api-gateway -n ${environment} --timeout=300s
        kubectl rollout status deployment/user-management-service -n ${environment} --timeout=300s
        kubectl rollout status deployment/course-management-service -n ${environment} --timeout=300s
        kubectl rollout status deployment/enrollment-service -n ${environment} --timeout=300s
        kubectl rollout status deployment/payment-service -n ${environment} --timeout=300s
        kubectl rollout status deployment/notification-service -n ${environment} --timeout=300s
        kubectl rollout status deployment/content-service -n ${environment} --timeout=300s
    """
}