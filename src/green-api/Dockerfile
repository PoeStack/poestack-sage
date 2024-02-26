FROM node:21-alpine3.18
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY . .
EXPOSE 3001
WORKDIR /opt/app/src/green-api
RUN npm install
RUN npm run build
CMD [ "npm", "start"]
