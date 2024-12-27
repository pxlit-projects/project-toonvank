FROM openjdk:21-slim
WORKDIR /app
COPY ./messaging-service/target/*.jar messaging.jar
EXPOSE 8079
ENTRYPOINT ["java", "-jar", "messaging.jar"]