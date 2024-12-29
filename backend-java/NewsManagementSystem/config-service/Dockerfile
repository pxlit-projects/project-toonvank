FROM openjdk:21-slim
RUN apt-get update && apt-get install -y curl
WORKDIR /app
COPY ./config-service/target/*.jar config.jar
EXPOSE 8088
ENTRYPOINT ["java", "-jar", "config.jar"]