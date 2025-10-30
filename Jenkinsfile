pipeline {
  agent any
  options { skipDefaultCheckout(false) }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Summary') {
      steps {
        sh '''
          echo "Repo: $(git config --get remote.origin.url)"
          echo "Branch: ${BRANCH_NAME:-unknown}"
          echo "Commit: $(git rev-parse --short HEAD)"
          echo "Top-level layout:"; ls -la
          echo "Modules (pom.xml):"; find . -name pom.xml | sed 's#^./##' || true
        '''
      }
    }
  }
}
