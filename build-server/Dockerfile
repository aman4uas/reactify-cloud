FROM node:lts

WORKDIR /home/app
COPY package*.json .
RUN npm install --production

COPY model.js model.js
COPY script.js script.js

ENTRYPOINT [ "node", "/home/app/script.js" ]