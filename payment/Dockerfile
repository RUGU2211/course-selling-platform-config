# Use OpenJDK base image
FROM openjdk:21-jdk

WORKDIR /app

# Copy built jar from target (ensure you build with mvn package first)
COPY target/*.jar app.jar

# Expose correct port (adjust if your payment service uses a different port)
EXPOSE 8086

ENTRYPOINT ["java", "-jar", "app.jar"]
