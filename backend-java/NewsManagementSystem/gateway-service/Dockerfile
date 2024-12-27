FROM openjdk:21-slim
WORKDIR /app
COPY ./gateway-service/target/*.jar gateway.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "gateway.jar"]