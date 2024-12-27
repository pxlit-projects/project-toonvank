FROM openjdk:21-slim
WORKDIR /app
COPY ./discovery-service/target/*.jar discovery.jar
EXPOSE 8061
ENTRYPOINT ["java", "-jar", "discovery.jar"]