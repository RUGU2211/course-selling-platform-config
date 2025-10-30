pipeline {
  agent any
  environment {
    KUBE_NAMESPACE = 'course-plat'
  }
  options { skipDefaultCheckout(false) }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Build Backend (all modules)') {
      steps {
        sh '''
          set -e
          echo "🔍 Scanning for modules with pom.xml..."
          # Only include directories that actually contain a pom.xml (ignore actuator if present)
          POMS=$(find . -mindepth 2 -maxdepth 2 -name pom.xml | grep -v actuator | sort)
          if [ -z "$POMS" ]; then
            echo "❌ No pom.xml files found!"
            exit 1
          fi
          for POM in $POMS; do
            moddir=$(dirname "$POM")
            if [ -f "$POM" ]; then
              echo "🚀 Packaging module via POM: $POM"
              # Show directory contents for debugging if needed
              ls -la "$moddir" || true
              docker run --rm \
                -v "$PWD":/ws \
                -w /ws \
                maven:3.9.9-eclipse-temurin-21 \
                mvn -B -q -DskipTests -f "$POM" clean package || exit 1
            else
              echo "⚠️ Skipping $moddir (no pom.xml found)"
            fi
          done
        '''
      }
    }
    stage('Build Images') {
      steps {
        script {
          env.IMAGE_TAG = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
        }
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
          sh '''
            echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin
            docker build -t $DOCKERHUB_USER/course-plat-api-gateway:$IMAGE_TAG api-gateway
            docker build -t $DOCKERHUB_USER/course-plat-eureka-server:$IMAGE_TAG eureka-server
            docker build -t $DOCKERHUB_USER/course-plat-config-server:$IMAGE_TAG config-server
            docker build -t $DOCKERHUB_USER/course-plat-user-service:$IMAGE_TAG user-management-service
            docker build -t $DOCKERHUB_USER/course-plat-course-service:$IMAGE_TAG course-management-service
            docker build -t $DOCKERHUB_USER/course-plat-enrollment-service:$IMAGE_TAG enrollmentservice
            docker build -t $DOCKERHUB_USER/course-plat-payment-service:$IMAGE_TAG payment
            docker build -t $DOCKERHUB_USER/course-plat-notification-service:$IMAGE_TAG notification-service
            docker build -t $DOCKERHUB_USER/course-plat-content-service:$IMAGE_TAG content-delivery-service
            docker build -t $DOCKERHUB_USER/course-plat-frontend:$IMAGE_TAG frontend
          '''
        }
      }
    }
    stage('Push Images') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
          sh '''
            for img in api-gateway eureka-server config-server user-service course-service enrollment-service payment-service notification-service content-service frontend; do
              docker push $DOCKERHUB_USER/course-plat-$img:$IMAGE_TAG || exit 1
            done
          '''
        }
      }
    }
    stage('Approval') {
      steps { input message: 'Deploy to Kubernetes?' }
    }
    stage('Deploy to K8s') {
      when { expression { env.BRANCH_NAME == 'master' } }
      steps {
        sh '''
          kubectl create ns $KUBE_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
          kubectl -n $KUBE_NAMESPACE apply -f k8s/
          kubectl -n $KUBE_NAMESPACE set image deploy/api-gateway api-gateway=$DOCKERHUB_USER/course-plat-api-gateway:$IMAGE_TAG || true
          kubectl -n $KUBE_NAMESPACE set image deploy/eureka-server eureka-server=$DOCKERHUB_USER/course-plat-eureka-server:$IMAGE_TAG || true
          kubectl -n $KUBE_NAMESPACE set image deploy/config-server config-server=$DOCKERHUB_USER/course-plat-config-server:$IMAGE_TAG || true
          kubectl -n $KUBE_NAMESPACE set image deploy/user-service user-service=$DOCKERHUB_USER/course-plat-user-service:$IMAGE_TAG || true
          kubectl -n $KUBE_NAMESPACE set image deploy/course-service course-service=$DOCKERHUB_USER/course-plat-course-service:$IMAGE_TAG || true
          kubectl -n $KUBE_NAMESPACE set image deploy/enrollment-service enrollment-service=$DOCKERHUB_USER/course-plat-enrollment-service:$IMAGE_TAG || true
          kubectl -n $KUBE_NAMESPACE set image deploy/payment-service payment-service=$DOCKERHUB_USER/course-plat-payment-service:$IMAGE_TAG || true
          kubectl -n $KUBE_NAMESPACE set image deploy/notification-service notification-service=$DOCKERHUB_USER/course-plat-notification-service:$IMAGE_TAG || true
          kubectl -n $KUBE_NAMESPACE set image deploy/content-service content-service=$DOCKERHUB_USER/course-plat-content-service:$IMAGE_TAG || true
          kubectl -n $KUBE_NAMESPACE set image deploy/frontend frontend=$DOCKERHUB_USER/course-plat-frontend:$IMAGE_TAG || true
          for d in api-gateway eureka-server config-server user-service course-service enrollment-service payment-service notification-service content-service frontend; do
            kubectl -n $KUBE_NAMESPACE rollout status deploy/$d || true
          done
        '''
      }
    }
  }
  post {
    always { archiveArtifacts artifacts: '**/target/*.jar', allowEmptyArchive: true }
  }
}
