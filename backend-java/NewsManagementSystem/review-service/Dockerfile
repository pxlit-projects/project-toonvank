FROM maven:3.8.4-openjdk-17 as builder
WORKDIR /app
COPY ./pom.xml ./pom.xml
COPY ./src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17
WORKDIR /app
COPY --from=builder /app/target/review-service-0.0.1-SNAPSHOT.jar app.jar
COPY ../scripts/wait.sh ./wait.sh
RUN chmod +x ./wait.sh
EXPOSE 8085
ENTRYPOINT [ "/bin/bash", "-c", "./wait.sh localhost:8061/actuator/health -- java -jar app.jar" ]