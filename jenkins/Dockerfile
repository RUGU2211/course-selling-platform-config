# Jenkins Docker Configuration for Course Selling Platform
FROM jenkins/jenkins:2.426.1-lts-jdk17

# Switch to root user to install additional tools
USER root

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    lsb-release \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    unzip \
    git \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Docker CLI
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y docker-ce-cli \
    && rm -rf /var/lib/apt/lists/*

# Install kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl \
    && rm kubectl

# Install Helm
RUN curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | tee /usr/share/keyrings/helm.gpg > /dev/null \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | tee /etc/apt/sources.list.d/helm-stable-debian.list \
    && apt-get update \
    && apt-get install -y helm \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install Maven
RUN wget https://archive.apache.org/dist/maven/maven-3/3.9.5/binaries/apache-maven-3.9.5-bin.tar.gz \
    && tar -xzf apache-maven-3.9.5-bin.tar.gz -C /opt \
    && ln -s /opt/apache-maven-3.9.5 /opt/maven \
    && rm apache-maven-3.9.5-bin.tar.gz

# Install Trivy for security scanning
RUN wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | tee /usr/share/keyrings/trivy.gpg > /dev/null \
    && echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | tee -a /etc/apt/sources.list.d/trivy.list \
    && apt-get update \
    && apt-get install -y trivy \
    && rm -rf /var/lib/apt/lists/*

# Install SonarScanner
RUN wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.8.0.2856-linux.zip \
    && unzip sonar-scanner-cli-4.8.0.2856-linux.zip -d /opt \
    && ln -s /opt/sonar-scanner-4.8.0.2856-linux /opt/sonar-scanner \
    && rm sonar-scanner-cli-4.8.0.2856-linux.zip

# Install k6 for performance testing
RUN wget https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz \
    && tar -xzf k6-v0.47.0-linux-amd64.tar.gz \
    && mv k6-v0.47.0-linux-amd64/k6 /usr/local/bin/ \
    && rm -rf k6-v0.47.0-linux-amd64*

# Install additional tools
RUN npm install -g \
    snyk \
    @lhci/cli \
    sonar-scanner

# Set environment variables
ENV MAVEN_HOME=/opt/maven
ENV SONAR_SCANNER_HOME=/opt/sonar-scanner
ENV PATH=$PATH:$MAVEN_HOME/bin:$SONAR_SCANNER_HOME/bin

# Copy Jenkins configuration
COPY jenkins/plugins.txt /usr/share/jenkins/ref/plugins.txt
COPY jenkins/jenkins.yaml /var/jenkins_home/casc_configs/jenkins.yaml
COPY jenkins/init.groovy.d/ /usr/share/jenkins/ref/init.groovy.d/

# Install Jenkins plugins
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

# Copy custom scripts
COPY jenkins/scripts/ /usr/local/bin/

# Set permissions
RUN chmod +x /usr/local/bin/*.sh

# Switch back to jenkins user
USER jenkins

# Set Jenkins configuration as code
ENV CASC_JENKINS_CONFIG=/var/jenkins_home/casc_configs/jenkins.yaml

# Expose Jenkins port
EXPOSE 8080 50000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/login || exit 1