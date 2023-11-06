# Stage 1: Copy Gradle files
FROM alpine AS copy-gradle-files
WORKDIR /app
COPY build.gradle.kts .
COPY settings.gradle.kts .
COPY ./src ./src
RUN mkdir gradle_struct
RUN find . -type f -name '*.gradle.kts' -exec cp --parents {} gradle_struct \;
RUN find . -type f -name 'package.json' -exec cp --parents {} gradle_struct \;
RUN find . -type f -name 'package-lock.json' -exec cp --parents {} gradle_struct \;

FROM adoptopenjdk:11-jre-hotspot as build

RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

WORKDIR /app

COPY gradlew .
COPY gradlew.bat .
COPY gradle ./gradle
COPY --from=copy-gradle-files /app/gradle_struct/ .

ARG PROJECT="src:insights-cache-updater"
ARG INSTALL_COMMAND="npmInstall"
ARG BUILD_COMMAND="npmBuild"

RUN ./gradlew $PROJECT:$INSTALL_COMMAND

copy ./src ./src

RUN ./gradlew $PROJECT:$BUILD_COMMAND

FROM --platform=linux/amd64 node:slim as runner
WORKDIR /app
COPY --from=build /app .











