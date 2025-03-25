FROM node:18-bullseye

WORKDIR /app/src


COPY src/package.json .
COPY src/package-lock.json .
# COPY src/static/gameFornt/package.json .
# COPY src/static/gameFornt/package-lock.json .
RUN npm install 

ENTRYPOINT ["node", "server.js"]