FROM node:18 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

FROM node:18-slim

WORKDIR /usr/src/app

# COPY --from=builder /usr/src/app/node_modules .
# COPY --from=builder /usr/src/app/package*.json .
COPY --from=builder /usr/src/app .

EXPOSE 8080

CMD [ "npm", "start" ]