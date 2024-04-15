#!/bin/bash
source config.sh

gcloud run deploy $CLOUD_RUN_SERVICE --image $REGION-docker.pkg.dev/$GOOGLE_PROJECT_ID/$CLOUD_BUILD_REPO/$CLOUD_RUN_SERVICE:$TAG \
  # --add-cloudsql-instances $INSTANCE_CONNECTION_NAME \
  # --set-env-vars INSTANCE_UNIX_SOCKET="/cloudsql/$INSTANCE_CONNECTION_NAME" \
  # --set-env-vars INSTANCE_CONNECTION_NAME="$INSTANCE_CONNECTION_NAME" \
  # --set-env-vars DB_NAME="$DB_NAME" \
  # --set-env-vars DB_USER="$DB_USER" \
  # --set-env-vars DB_PASS="$DB_PASS" \
  # --set-env-vars DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost/$DB_NAME?host=/cloudsql/$INSTANCE_CONNECTION_NAME" \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port $PORT \
  --project=$GOOGLE_PROJECT_ID