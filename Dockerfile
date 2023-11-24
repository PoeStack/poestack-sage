FROM node:20-buster

RUN apt-get update && \
    apt-get install -y \
    g++ \
    make \
    cmake \
    unzip \
    default-jre \
    libcurl4-openssl-dev

WORKDIR /app

ENV NPM_CONFIG_CACHE=/tmp/.npm

RUN npm install aws-lambda-ric -g

COPY . .
