#!/bin/sh
set -e
if [ "$1" = 'nginx' ]; then
  envsubst "$(cat /etc/nginx/nginx.conf.template | sed -n 's/.*${\([A-Z_]*\)}.*/$\1/p')" < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
  if [ "$ENV_FILE" != "" ]; then
    if [ -f "$ENV_FILE" ]; then
      cp $ENV_FILE $ENV_FILE\.template
      unlink $ENV_FILE
      envsubst "$(cat $ENV_FILE\.template | sed -n 's/.*${\([A-Z_]*\)}.*/$\1/p')" < $ENV_FILE\.template > $ENV_FILE

      if [ "$INDEX_FILE" != "" ]; then
        if [ -f "$INDEX_FILE" ]; then
          today=$(date +%s)
          sed -i 's/env.js/env.js?v='$today'/' $INDEX_FILE
        fi
      fi
    fi
  fi
fi
exec "$@"
