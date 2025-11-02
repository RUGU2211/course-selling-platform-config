# Use OpenJDK base image
FROM openjdk:21-jdk
# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Copy built jar from target (ensure you build with mvn package first)
COPY target/*.jar app.jar
# Expose correct port (see summary for each service)
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]
