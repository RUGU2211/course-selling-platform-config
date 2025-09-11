# Use OpenJDK base image
FROM openjdk:21-jdk

WORKDIR /app

# Copy built jar from target (ensure you build with mvn package first)
COPY target/*.jar app.jar

# Expose correct port (change if your service runs on a different port)
EXPOSE 8087

ENTRYPOINT ["java", "-jar", "app.jar"]
