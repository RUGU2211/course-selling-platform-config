pipeline {
  agent any

  environment {
    // Docker registry
    DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
    DOCKER_REPO = 'rugved2211/course-selling-platf'
    IMAGE_TAG = "${env.GIT_COMMIT?.take(7) ?: 'local'}"

    // Kubernetes contexts (configure on Jenkins agents beforehand)
    KUBE_CONTEXT_DEV  = 'k8s-dev'
    KUBE_CONTEXT_UAT  = 'k8s-uat'
    KUBE_CONTEXT_PROD = 'k8s-prod'
  }

  options {
    timestamps()
    skipStagesAfterUnstable()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Test (Maven)') {
      steps {
        withMaven(maven: 'Maven-3') {
          sh 'mvn -B -DskipTests=false clean verify'
        }
      }
      post {
        unsuccessful { junit '**/target/surefire-reports/*.xml' }
        success { junit '**/target/surefire-reports/*.xml' }
      }
    }

    stage('Build Docker Images') {
      steps {
        script {
          def services = [
            [name: 'eureka-server',           path: 'eureka-server'],
            [name: 'config-server',           path: 'config-server'],
            [name: 'user-service',            path: 'user-management-service'],
            [name: 'course-service',          path: 'course-management-service'],
            [name: 'enrollment-service',      path: 'enrollmentservice'],
            [name: 'notification-service',    path: 'notification-service'],
            [name: 'payment-service',         path: 'payment'],
            [name: 'content-service',         path: 'content-delivery-service'],
            [name: 'api-gateway',             path: 'api-gateway'],
            [name: 'frontend',                path: 'frontend']
          ]

          docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB_CREDENTIALS) {
            services.each { svc ->
              dir(svc.path) {
                sh "docker build -t ${DOCKER_REPO}:${svc.name}-${IMAGE_TAG} ."
                sh "docker push ${DOCKER_REPO}:${svc.name}-${IMAGE_TAG}"
                // Also update the 'latest' tag for convenience
                sh "docker tag ${DOCKER_REPO}:${svc.name}-${IMAGE_TAG} ${DOCKER_REPO}:${svc.name}"
                sh "docker push ${DOCKER_REPO}:${svc.name}"
              }
            }
          }
        }
      }
    }

    stage('Deploy to Dev') {
      steps {
        script { deployToEnv('dev', env.KUBE_CONTEXT_DEV) }
      }
    }

    stage('Approve UAT') {
      steps { input message: 'Promote to UAT?', ok: 'Deploy' }
    }
    stage('Deploy to UAT') {
      steps {
        script { deployToEnv('uat', env.KUBE_CONTEXT_UAT) }
      }
    }

    stage('Approve Prod') {
      steps { input message: 'Promote to Prod?', ok: 'Deploy' }
    }
    stage('Deploy to Prod') {
      steps {
        script { deployToEnv('prod', env.KUBE_CONTEXT_PROD) }
      }
    }
  }

  post {
    success { echo "Pipeline success: ${env.BUILD_TAG}" }
    failure { echo "Pipeline failed: ${env.BUILD_TAG}" }
  }
}

// Helper to deploy all services to a given namespace
def deployToEnv(String namespace, String kubeContext) {
  def services = [
    'eureka-server', 'config-server', 'user-service', 'course-service',
    'enrollment-service', 'notification-service', 'payment-service',
    'content-service', 'api-gateway', 'frontend'
  ]

  sh "kubectl --context=${kubeContext} get ns ${namespace} || kubectl --context=${kubeContext} create ns ${namespace}"
  sh "kubectl --context=${kubeContext} -n ${namespace} apply -f k8s/"

  services.each { svc ->
    sh "kubectl --context=${kubeContext} -n ${namespace} set image deployment/${svc} ${svc}=${env.DOCKER_REPO}:${svc}-${env.IMAGE_TAG} --record=true || true"
  }
}

pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'rugved2211'
        KUBECONFIG = credentials('kubeconfig')
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Code checked out successfully'
            }
        }
        
        stage('Test Backend Services') {
            steps {
                script {
                    def services = [
                        'user-management-service',
                        'course-management-service',
                        'enrollmentservice',
                        'notification-service',
                        'payment',
                        'content-delivery-service'
                    ]
                    
                    services.each { service ->
                        echo "Testing ${service}..."
                        dir(service) {
                            sh 'mvn clean test || true'
                        }
                    }
                }
            }
        }
        
        stage('Test Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci || true'
                    sh 'npm test -- --coverage || true'
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('User Service') {
                    steps {
                        dir('user-management-service') {
                            sh '''
                                docker build -t ${DOCKER_REGISTRY}/user-service:${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/user-service:${BUILD_NUMBER} ${DOCKER_REGISTRY}/user-service:latest
                            '''
                        }
                    }
                }
                stage('Course Service') {
                    steps {
                        dir('course-management-service') {
                            sh '''
                                docker build -t ${DOCKER_REGISTRY}/course-service:${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/course-service:${BUILD_NUMBER} ${DOCKER_REGISTRY}/course-service:latest
                            '''
                        }
                    }
                }
                stage('Enrollment Service') {
                    steps {
                        dir('enrollmentservice') {
                            sh '''
                                docker build -t ${DOCKER_REGISTRY}/enrollment-service:${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/enrollment-service:${BUILD_NUMBER} ${DOCKER_REGISTRY}/enrollment-service:latest
                            '''
                        }
                    }
                }
                stage('Payment Service') {
                    steps {
                        dir('payment') {
                            sh '''
                                docker build -t ${DOCKER_REGISTRY}/payment-service:${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/payment-service:${BUILD_NUMBER} ${DOCKER_REGISTRY}/payment-service:latest
                            '''
                        }
                    }
                }
                stage('Notification Service') {
                    steps {
                        dir('notification-service') {
                            sh '''
                                docker build -t ${DOCKER_REGISTRY}/notification-service:${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/notification-service:${BUILD_NUMBER} ${DOCKER_REGISTRY}/notification-service:latest
                            '''
                        }
                    }
                }
                stage('Content Service') {
                    steps {
                        dir('content-delivery-service') {
                            sh '''
                                docker build -t ${DOCKER_REGISTRY}/content-service:${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/content-service:${BUILD_NUMBER} ${DOCKER_REGISTRY}/content-service:latest
                            '''
                        }
                    }
                }
                stage('Eureka Server') {
                    steps {
                        dir('eureka-server') {
                            sh '''
                                docker build -t ${DOCKER_REGISTRY}/eureka-server:${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/eureka-server:${BUILD_NUMBER} ${DOCKER_REGISTRY}/eureka-server:latest
                            '''
                        }
                    }
                }
                stage('Config Server') {
                    steps {
                        dir('config-server') {
                            sh '''
                                docker build -t ${DOCKER_REGISTRY}/config-server:${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/config-server:${BUILD_NUMBER} ${DOCKER_REGISTRY}/config-server:latest
                            '''
                        }
                    }
                }
                stage('API Gateway') {
                    steps {
                        dir('api-gateway') {
                            sh '''
                                docker build -t ${DOCKER_REGISTRY}/api-gateway:${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/api-gateway:${BUILD_NUMBER} ${DOCKER_REGISTRY}/api-gateway:latest
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        docker build -t ${DOCKER_REGISTRY}/frontend:${BUILD_NUMBER} .
                        docker tag ${DOCKER_REGISTRY}/frontend:${BUILD_NUMBER} ${DOCKER_REGISTRY}/frontend:latest
                    '''
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "Logging into Docker Hub..."
                        docker login -u $DOCKER_USER -p $DOCKER_PASS
                        
                        echo "Pushing services to Docker Hub..."
                        docker push ${DOCKER_REGISTRY}/user-service:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/user-service:latest
                        docker push ${DOCKER_REGISTRY}/course-service:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/course-service:latest
                        docker push ${DOCKER_REGISTRY}/enrollment-service:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/enrollment-service:latest
                        docker push ${DOCKER_REGISTRY}/payment-service:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/payment-service:latest
                        docker push ${DOCKER_REGISTRY}/notification-service:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/notification-service:latest
                        docker push ${DOCKER_REGISTRY}/content-service:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/content-service:latest
                        docker push ${DOCKER_REGISTRY}/eureka-server:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/eureka-server:latest
                        docker push ${DOCKER_REGISTRY}/config-server:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/config-server:latest
                        docker push ${DOCKER_REGISTRY}/api-gateway:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/api-gateway:latest
                        docker push ${DOCKER_REGISTRY}/frontend:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/frontend:latest
                        
                        echo "All images pushed successfully!"
                    '''
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            when {
                branch 'master'
            }
            steps {
                script {
                    echo 'Deploying to Kubernetes...'
                    
                    sh '''
                        # Update image tags in manifests
                        cd k8s
                        find . -name "*.yaml" -type f -exec sed -i "s/${DOCKER_REGISTRY}\\/.*:/${DOCKER_REGISTRY}\\/:${BUILD_NUMBER}/g" {} \\;
                        
                        # Apply all manifests
                        kubectl apply -f .
                        
                        # Wait for deployments to be ready
                        kubectl rollout status deployment/user-service -n course-platform --timeout=5m
                        kubectl rollout status deployment/course-service -n course-platform --timeout=5m
                        kubectl rollout status deployment/enrollment-service -n course-platform --timeout=5m
                        kubectl rollout status deployment/payment-service -n course-platform --timeout=5m
                        kubectl rollout status deployment/notification-service -n course-platform --timeout=5m
                        kubectl rollout status deployment/content-service -n course-platform --timeout=5m
                        kubectl rollout status deployment/frontend -n course-platform --timeout=5m
                        
                        echo "Deployment completed successfully!"
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded! ✅'
            emailext(
                subject: "Build Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "The build was successful.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        failure {
            echo 'Pipeline failed! ❌'
            emailext(
                subject: "Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "The build failed. Please check the logs.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}
