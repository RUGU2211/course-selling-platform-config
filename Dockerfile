FROM jenkins/jenkins:lts
USER root
# Install docker client in Jenkins (if building containers from Jenkins)
RUN apt-get update && \
    apt-get install -y docker.io
USER jenkins
