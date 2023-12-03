FROM node:20-buster

RUN apt-get update && \
    apt-get install -y \
    default-jre

WORKDIR /app

ENV NPM_CONFIG_CACHE=/tmp/.npm

COPY . .
