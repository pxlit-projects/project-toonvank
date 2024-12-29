FROM openjdk:21-slim
WORKDIR /app
COPY ./review-service/target/*.jar review.jar
EXPOSE 3308
ENTRYPOINT ["java", "-jar", "review.jar"]