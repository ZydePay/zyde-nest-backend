#!/bin/bash
source config.sh

gcloud builds submit --region=$REGION  --tag $REGION-docker.pkg.dev/$GOOGLE_PROJECT_ID/$CLOUD_BUILD_REPO/$CLOUD_RUN_SERVICE:$TAG
