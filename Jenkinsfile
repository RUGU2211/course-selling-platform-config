pipeline {
  agent any
  environment {
    DOCKERHUB_USER = credentials('dockerhub-creds').username
    DOCKERHUB_PASS = credentials('dockerhub-creds').password
    KUBE_NAMESPACE = 'course-plat'
  }
  options { skipDefaultCheckout(false) }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Unit Tests') {
      steps {
        sh '''
          ./mvnw -q -DskipITs test -pl api-gateway,eureka-server,config-server,user-management-service,course-management-service,enrollmentservice,payment,notification-service,content-delivery-service || true
          cd frontend && npm ci && npm test -- --watch=false || true
        '''
      }
    }
    stage('Build Images') {
      steps {
        script {
          env.IMAGE_TAG = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
        }
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
    stage('Push Images') {
      steps {
        sh '''
          for img in api-gateway eureka-server config-server user-service course-service enrollment-service payment-service notification-service content-service frontend; do
            docker push $DOCKERHUB_USER/course-plat-$img:$IMAGE_TAG || exit 1
          done
        '''
      }
    }
    stage('Approval') {
      steps { input message: 'Deploy to Kubernetes?' }
    }
    stage('Deploy to K8s') {
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
