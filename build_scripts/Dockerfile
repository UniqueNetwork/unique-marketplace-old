FROM node:lts as src

ARG WORKDIR=/app
WORKDIR /app

COPY . .

RUN cd packages/apps && yarn install

RUN yarn build:www


FROM nginx:alpine

RUN apk update && apk upgrade && apk add bash

ARG WORKDIR=/app
ARG CI_COMMIT_SHORT_SHA=none
ARG DIR=${WORKDIR}/packages/apps/build

RUN rm -rf /usr/share/nginx/html
RUN rm -rf /etc/nginx/conf.d
RUN unlink /etc/nginx/nginx.conf
COPY ./build_scripts/nginx.conf /etc/nginx/
RUN mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.template
COPY --from=src ${DIR} /usr/share/nginx/html
COPY build_scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Envs
ENV DNS_RESOLVER=127.0.0.1
ENV PORT=80
ENV ENV_FILE=/usr/share/nginx/html/env.js
ENV INDEX_FILE=/usr/share/nginx/html/index.html
ENV PRODUCTION=true

ARG TAG=''
ENV TAG=${TAG}

EXPOSE ${PORT}
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["nginx"]
