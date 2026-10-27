FROM node:24-slim

## Install system dependencies, `gcsfuse` in particular.
RUN set -e; \
    apt-get update -y && apt-get install -y \
    curl \
    gnupg2 \
    tini \
    openssl \
    lsof \
    lsb-release; \
    gcsFuseRepo=gcsfuse-`lsb_release -c -s`; \
    echo "deb http://packages.cloud.google.com/apt $gcsFuseRepo main" | \
    tee /etc/apt/sources.list.d/gcsfuse.list; \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
    apt-key add -; \
    apt-get update; \
    apt-get install -y gcsfuse \
    && apt-get clean

ENV APP_DIR /app
## Set fallback mount directory
ENV MNT_DIR /app/gcs
ENV HOST 0.0.0.0
ENV PORT 3000

RUN mkdir -p $APP_DIR

WORKDIR $APP_DIR

COPY package.json yarn.lock $APP_DIR/

## Install application dependencies without `yarn postinstall`
RUN SKIP_POSTINSTALL=1 yarn install

COPY . $APP_DIR/

## 移除 Node 21+ 內建的 navigator(詳見 strip-navigator.js);設成 ENV 讓 postinstall/build/runtime 皆套用。
ENV NODE_OPTIONS="--require /app/scripts/strip-navigator.js"

## Run yarn postinstall
RUN yarn postinstall

## Build application bundles
RUN yarn build

RUN yarn cache clean

## Ensure the script is executable
RUN chmod +x run.sh

EXPOSE 3000

## Use tini to manage zombie processes and signal forwarding
## https://github.com/krallin/tini
ENTRYPOINT ["/usr/bin/tini", "--"]

## Pass the startup script as arguments to Tini
CMD [ "/app/run.sh"]
