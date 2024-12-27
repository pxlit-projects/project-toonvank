FROM openjdk:21-slim
WORKDIR /app
COPY ./comment-service/target/*.jar comment.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "comment.jar"]