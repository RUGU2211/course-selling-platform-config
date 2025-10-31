FROM jenkins/jenkins:lts
USER root
# Install tools
RUN apt-get update && apt-get install -y curl ca-certificates gnupg lsb-release && rm -rf /var/lib/apt/lists/*
# Install Docker CLI
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker.gpg \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list \
 && apt-get update && apt-get install -y docker-ce-cli && rm -rf /var/lib/apt/lists/*
# Install kubectl
RUN curl -Lo /usr/local/bin/kubectl https://storage.googleapis.com/kubernetes-release/release/v1.29.6/bin/linux/amd64/kubectl \
 && chmod +x /usr/local/bin/kubectl
# Install kind
RUN curl -Lo /usr/local/bin/kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-amd64 \
 && chmod +x /usr/local/bin/kind
# Install required Jenkins plugins (latest)
RUN jenkins-plugin-cli --plugins \
  credentials \
  credentials-binding \
  git \
  github \
  workflow-aggregator \
  docker-workflow \
  blueocean \
  pipeline-stage-view \
  ssh-agent \
  kubernetes-cli \
  configuration-as-code
# Disable setup wizard
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
# Keep as root user - docker-compose will control the user
# USER jenkins
