#!/usr/bin/env bash
set -eo pipefail

# Run the web service on container startup on the background.
yarn run db-migrate
yarn start &

# Create mount directory for service
mkdir -p $MNT_DIR

echo "Mounting GCS Fuse."
gcsfuse --debug_gcs --debug_fuse $GCS_BUCKET $MNT_DIR
echo "Mounting completed."

# Exit immediately when one of the background processes terminate.
wait -n
