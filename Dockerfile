FROM node:14.15.5-alpine3.10 as builder

WORKDIR /apps

COPY . .

RUN yarn

RUN yarn build

# ===========================================================
FROM nginx:1.16.0-alpine

WORKDIR /usr/share/nginx/html

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /apps/packages/apps/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
