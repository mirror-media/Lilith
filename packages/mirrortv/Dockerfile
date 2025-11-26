FROM node:18-slim

## Install system dependencies, `gcsfuse` in particular.
RUN set -e; \
    apt-get update -y && apt-get install -y \
    curl \
    gnupg2 \
    tini \
    lsof \
    openssl \
    ffmpeg \
    lsb-release; \
    gcsFuseRepo=gcsfuse-`lsb_release -c -s`; \
    echo "deb http://packages.cloud.google.com/apt $gcsFuseRepo main" | \
    tee /etc/apt/sources.list.d/gcsfuse.list; \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
    apt-key add -; \
    apt-get update; \
    apt-get install -y gcsfuse \
    && apt-get clean

ENV APP_DIR=/app
## Set fallback mount directory
ENV MNT_DIR=/app/gcs
ENV HOST=0.0.0.0
ENV PORT=3000

RUN mkdir -p $APP_DIR

WORKDIR $APP_DIR

## Copy dependency files
COPY package.json yarn.lock ./
COPY patches ./patches

## Install application dependencies
## --frozen-lockfile: Ensure consistent dependency versions
RUN yarn install

## Copy application source code
COPY . .

## Generates Prisma Client and Keystone artifacts
RUN yarn keystone postinstall --fix

## Build application bundles
RUN yarn build

RUN yarn cache clean

RUN whereis http2-proxy-server
## Ensure the script is executable
RUN chmod +x run.sh

EXPOSE 3000

## Use tini to manage zombie processes and signal forwarding
## https://github.com/krallin/tini
ENTRYPOINT ["/usr/bin/tini", "--"]

## Pass the startup script as arguments to Tini
CMD [ "/app/run.sh"]
