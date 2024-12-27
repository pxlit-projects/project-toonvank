FROM openjdk:21-slim
WORKDIR /app
COPY ./config-service/target/*.jar config.jar
EXPOSE 8088
ENTRYPOINT ["java", "-jar", "config.jar"]