pipeline {
  agent any
  environment { KUBE_NAMESPACE = 'course-plat' }
  parameters {
    booleanParam(name: 'FORCE_DEPLOY', defaultValue: false, description: 'Deploy to Kubernetes regardless of branch')
  }
  options { skipDefaultCheckout(false) }
  stages {
    stage('Checkout') { steps { checkout scm } }

    stage('Unit Test & Package') {
      steps {
        sh '''
          set -e
          echo "Scanning for module pom.xml files..."
          POMS=$(find "$PWD" -mindepth 2 -maxdepth 2 -name pom.xml | grep -v actuator | sort)
          if [ -z "$POMS" ]; then echo "No pom.xml found"; exit 1; fi
          for POM in $POMS; do
            moddir=$(dirname "$POM")
            echo "Running mvn in: $moddir"
            (cd "$moddir" && chmod +x mvnw 2>/dev/null || true)
            (cd "$moddir" && ./mvnw -q -DskipITs -Dspring.profiles.active=test -Dspring.cloud.config.enabled=false -Deureka.client.enabled=false test) || true
            (cd "$moddir" && ./mvnw -q -DskipTests -Dspring.profiles.active=test -Dspring.cloud.config.enabled=false -Deureka.client.enabled=false clean package) || exit 1
          done
        '''
      }
    }

    stage('Build Images') {
      steps {
        script { env.IMAGE_TAG = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim() }
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
          sh '''
            echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin
            for svc in api-gateway eureka-server config-server user-management-service course-management-service enrollmentservice payment notification-service content-delivery-service frontend; do
              if [ -f "$svc/Dockerfile" ]; then
                echo "Building image for $svc"
                docker build -t $DOCKERHUB_USER/course-plat-$(echo $svc | tr '_' '-'):$IMAGE_TAG $svc || exit 1
              fi
            done
          '''
        }
      }
    }

    stage('Push Images') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
          sh '''
            for img in api-gateway eureka-server config-server user-management-service course-management-service enrollmentservice payment notification-service content-delivery-service frontend; do
              repo=$DOCKERHUB_USER/course-plat-$(echo $img | tr '_' '-'):$IMAGE_TAG
              docker image inspect $repo >/dev/null 2>&1 && docker push $repo || true
            done
          '''
        }
      }
    }

    stage('Deploy to K8s') {
      when { expression { return (env.BRANCH_NAME == 'master' || env.BRANCH_NAME == 'main' || params.FORCE_DEPLOY == true) } }
      steps {
        sh '''
          echo "BRANCH_NAME=$BRANCH_NAME FORCE_DEPLOY=$FORCE_DEPLOY"
          kubectl create ns $KUBE_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
          kubectl -n $KUBE_NAMESPACE apply -f k8s/ || true
          for d in api-gateway eureka-server config-server user-service course-service enrollment-service payment-service notification-service content-service frontend; do
            imgname=$(echo $d | sed 's/_/-/g')
            kubectl -n $KUBE_NAMESPACE set image deploy/$d $d=$DOCKERHUB_USER/course-plat-$imgname:$IMAGE_TAG || true
            kubectl -n $KUBE_NAMESPACE rollout status deploy/$d || true
          done
        '''
      }
    }
  }
}
