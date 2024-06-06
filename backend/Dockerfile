FROM node:18
LABEL authors="VeiTr"

WORKDIR /usr/src/app


COPY package*.json ./
RUN npm install


COPY . .

COPY .env ./


EXPOSE 5000


CMD ["node", "server.js"]
