#!/usr/bin/env bash
# set -eo pipefail

# Create mount directory for service
mkdir -p $MNT_DIR

echo "Mounting GCS Fuse."
gcsfuse --debug_gcs --debug_fuse $GCS_BUCKET $MNT_DIR
echo "Mounting completed."

# Run the web service on container startup on the background.
yarn run db-migrate

#for http/2 proxy
if [ "$IS_UI_DISABLED" = "true" ]
then
  # Keystone server is GQL mode
  PORT=$KEYSTONE_SERVER_PORT yarn start &
else
  # Keystone server is CMS mode
  PORT=$KEYSTONE_SERVER_PORT yarn start &

  isServerRunning=`lsof -Pi :$KEYSTONE_SERVER_PORT -sTCP:LISTEN -t`
  while [ -z "$isServerRunning" ]
  do
    echo "Keystone server is not ready."
    sleep 5
    isServerRunning=`lsof -Pi :$KEYSTONE_SERVER_PORT -sTCP:LISTEN -t`
  done

  echo "Keystone server is ready."

  # Run the http2 reverse proxy server, which proxies http2 request to web server
  PORT=$REVERSE_PROXY_PORT yarn run start-http2-proxy-server &
fi

#`yarn start &

# Exit immediately when one of the background processes terminate.
wait -n
