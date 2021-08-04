# ======================BUILD======================================

FROM node:latest as builder

WORKDIR /apps
COPY . .

RUN yarn install && yarn build:www

# ======================RUN========================================

FROM nginx:1.19

WORKDIR /usr/share/nginx/html

COPY --from=builder /apps/packages/apps/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
