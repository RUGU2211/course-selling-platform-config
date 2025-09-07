pipeline {
    agent any
    tools {
        jdk 'jdk-21'
        maven 'maven-3.9'
    }
    environment {
        DOCKER_REGISTRY = "rugved2211"
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/RUGU2211/course-selling-platf.git'
            }
        }
        stage('Determine Changes') {
            steps {
                script {
                    def changes = sh(script: "git diff --name-only HEAD~1 HEAD", returnStdout: true).trim()
                    echo "Changed files: ${changes}"
                    env.CHANGED_PATHS = changes
                }
            }
        }
        stage('Build, Docker & Deploy') {
            steps {
                script {
                    def services = [
                        "api-gateway": "8080",
                        "config-server": "8888",
                        "eureka-server": "8761",
                        "user-management-service": "8081",
                        "course-management-service": "8082",
                        "enrollmentservice": "8083",
                        "notification-service": "8085"
                    ]

                    services.each { service, port ->
                        if (env.CHANGED_PATHS.contains("${service}/")) {
                            echo "Building and deploying ${service}"

                            dir(service) {
                                sh "mvn clean package -DskipTests"
                            }

                            def imageTag = "${env.DOCKER_REGISTRY}/${service}:${env.BUILD_NUMBER}"

                            withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials-id', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                                dir(service) {
                                    sh """
                                    docker build -t ${imageTag} .
                                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                                    docker push ${imageTag}
                                    docker-compose up -d --no-deps ${service}
                                    """
                                }
                            }
                        } else {
                            echo "No changes detected for ${service}, skipping build."
                        }
                    }
                }
            }
        }
    }
}
