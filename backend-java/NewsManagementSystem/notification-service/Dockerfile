FROM openjdk:21-slim
WORKDIR /app
COPY ./notification-service/target/*.jar post.jar
EXPOSE 8079
ENTRYPOINT ["java", "-jar", "post.jar"]