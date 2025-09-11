# Use OpenJDK base image
FROM openjdk:21-jdk
WORKDIR /app
# Copy built jar from target (ensure you build with mvn package first)
COPY target/*.jar app.jar
# Expose correct port (see summary for each service)
EXPOSE 8888
ENTRYPOINT ["java", "-jar", "app.jar"]
