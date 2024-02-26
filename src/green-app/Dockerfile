FROM node:21-alpine3.18
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY . .
EXPOSE 3000
WORKDIR /opt/app/src/green-app
RUN npm install
RUN npm run build
CMD [ "npm", "start"]
