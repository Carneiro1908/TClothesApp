#!/bin/bash
set -euo pipefail

IMAGE="$1"
PROJECT="tclothes-prod-20261109"
REGISTRY="$(echo "$IMAGE" | cut -d/ -f1)"

gcloud auth configure-docker "$REGISTRY" --quiet
docker pull "$IMAGE"
docker network inspect tclothes-public >/dev/null 2>&1 || docker network create tclothes-public
docker rm -f tclothes || true
AUTH_SECRET="$(gcloud secrets versions access latest --secret=tclothes-auth-secret --project="$PROJECT")"
NEXTAUTH_URL="$(gcloud secrets versions access latest --secret=tclothes-nextauth-url --project="$PROJECT")"
docker run -d --name tclothes --restart unless-stopped --network tclothes-public -v /data:/data \
  -e DATABASE_PATH=/data/tclothes.db -e UPLOADS_DIR=/data/product-uploads -e AUTH_SECRET="$AUTH_SECRET" \
  -e NEXTAUTH_SECRET="$AUTH_SECRET" -e NEXTAUTH_URL="$NEXTAUTH_URL" \
  -e AUTH_URL="$NEXTAUTH_URL" -e AUTH_TRUST_HOST=true \
  "$IMAGE"
