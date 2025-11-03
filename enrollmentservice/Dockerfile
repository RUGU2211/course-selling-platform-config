# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Create Maven settings with improved network handling
RUN mkdir -p ~/.m2 && \
    echo '<?xml version="1.0" encoding="UTF-8"?>' > ~/.m2/settings.xml && \
    echo '<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0">' >> ~/.m2/settings.xml && \
    echo '  <mirrors>' >> ~/.m2/settings.xml && \
    echo '    <mirror>' >> ~/.m2/settings.xml && \
    echo '      <id>central</id>' >> ~/.m2/settings.xml && \
    echo '      <name>Maven Central</name>' >> ~/.m2/settings.xml && \
    echo '      <url>https://repo1.maven.org/maven2</url>' >> ~/.m2/settings.xml && \
    echo '      <mirrorOf>central</mirrorOf>' >> ~/.m2/settings.xml && \
    echo '    </mirror>' >> ~/.m2/settings.xml && \
    echo '  </mirrors>' >> ~/.m2/settings.xml && \
    echo '</settings>' >> ~/.m2/settings.xml

# Copy source files
COPY pom.xml .
COPY src ./src

# Build with retry logic and better error handling
# -U forces update of dependencies
# Retry handler counts help with network issues
RUN mvn -U \
        -Dmaven.wagon.http.retryHandler.count=5 \
        -Dmaven.wagon.httpconnectionManager.ttlSeconds=300 \
        -Dmaven.wagon.httpconnectionManager.eagerCheckEnabled=true \
        -DskipTests \
        clean package || \
    (echo "=== First build attempt failed, retrying in 15 seconds ===" && \
     sleep 15 && \
     mvn -U \
         -Dmaven.wagon.http.retryHandler.count=5 \
         -Dmaven.wagon.httpconnectionManager.ttlSeconds=300 \
         -Dmaven.wagon.httpconnectionManager.eagerCheckEnabled=true \
         -DskipTests \
         clean package)

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
