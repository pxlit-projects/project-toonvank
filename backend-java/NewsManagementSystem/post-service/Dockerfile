FROM openjdk:21-slim
WORKDIR /app
COPY ./post-service/target/*.jar post.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "post.jar"]