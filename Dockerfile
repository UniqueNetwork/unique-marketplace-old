# application build

FROM node:12.19.0-alpine as build-deps

WORKDIR /app

COPY package.json /app/package.json

RUN yarn install

COPY . /app

RUN yarn build

# hosting

FROM nginx:1.16.0-alpine

COPY --from=build-deps /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
