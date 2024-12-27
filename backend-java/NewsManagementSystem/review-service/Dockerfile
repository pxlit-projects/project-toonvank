FROM openjdk:21-slim
WORKDIR /app
COPY ./review-service/target/*.jar review.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "review.jar"]