FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
COPY . .
# RUN npm run build

EXPOSE 8080
CMD [ "node", "--inspect=0.0.0.0:9229", "server/server.js" ]
