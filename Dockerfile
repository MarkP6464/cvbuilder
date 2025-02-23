FROM node:18.17.0 AS dependency

WORKDIR /app
COPY package.json .
RUN yarn install --frozen-lockfile

FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=dependency /app/node_modules ./node_modules
COPY . .
RUN env
RUN yarn build

CMD [ "yarn","start" ]