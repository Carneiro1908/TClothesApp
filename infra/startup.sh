#!/bin/bash
set -euxo pipefail
apt-get update
apt-get install -y docker.io curl ca-certificates gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /etc/apt/keyrings/cloud.google.gpg
echo "deb [signed-by=/etc/apt/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" > /etc/apt/sources.list.d/google-cloud-sdk.list
apt-get update
apt-get install -y google-cloud-cli
systemctl enable --now docker

DEVICE=/dev/disk/by-id/google-tclothes-data
mkdir -p /data
if ! blkid "$DEVICE"; then mkfs.ext4 -F "$DEVICE"; fi
UUID=$(blkid -s UUID -o value "$DEVICE")
grep -q "$UUID" /etc/fstab || echo "UUID=$UUID /data ext4 defaults,nofail 0 2" >> /etc/fstab
mount -a
chmod 0777 /data

docker network inspect tclothes-public >/dev/null 2>&1 || docker network create tclothes-public
mkdir -p /opt/caddy
cat >/opt/caddy/Caddyfile <<'CADDY'
aquiles-design.duckdns.org {
  encode zstd gzip
  reverse_proxy tclothes:3000
}
CADDY
docker pull caddy:2-alpine
docker rm -f caddy || true
docker run -d --name caddy --restart unless-stopped --network tclothes-public \
  -p 80:80 -p 443:443 \
  -v /opt/caddy/Caddyfile:/etc/caddy/Caddyfile:ro \
  -v caddy_data:/data -v caddy_config:/config caddy:2-alpine

cat >/usr/local/bin/deploy-tclothes <<'DEPLOY'
#!/bin/bash
set -euo pipefail
IMAGE="$1"
PROJECT=$(curl -fsH 'Metadata-Flavor: Google' http://metadata.google.internal/computeMetadata/v1/project/project-id)
gcloud auth configure-docker "$(echo "$IMAGE" | cut -d/ -f1)" --quiet
docker pull "$IMAGE"
docker rm -f tclothes || true
docker run -d --name tclothes --restart unless-stopped --network tclothes-public -v /data:/data \
  -e AUTH_SECRET="$(gcloud secrets versions access latest --secret=tclothes-auth-secret --project="$PROJECT")" \
  -e NEXTAUTH_SECRET="$(gcloud secrets versions access latest --secret=tclothes-auth-secret --project="$PROJECT")" \
  -e NEXTAUTH_URL="$(gcloud secrets versions access latest --secret=tclothes-nextauth-url --project="$PROJECT")" \
  -e AUTH_URL="$(gcloud secrets versions access latest --secret=tclothes-nextauth-url --project="$PROJECT")" \
  -e AUTH_TRUST_HOST=true \
  "$IMAGE"
DEPLOY
chmod +x /usr/local/bin/deploy-tclothes

cat >/usr/local/bin/pull-tclothes-latest <<'PULL'
#!/bin/bash
set -euo pipefail
PROJECT=$(curl -fsH 'Metadata-Flavor: Google' http://metadata.google.internal/computeMetadata/v1/project/project-id)
IMAGE="europe-west1-docker.pkg.dev/${PROJECT}/tclothes/tclothes:latest"
gcloud auth configure-docker europe-west1-docker.pkg.dev --quiet
docker pull "$IMAGE"
NEW_IMAGE=$(docker image inspect --format '{{.Id}}' "$IMAGE")
CURRENT_IMAGE=$(docker inspect --format '{{.Image}}' tclothes 2>/dev/null || true)
if [[ "$NEW_IMAGE" == "$CURRENT_IMAGE" ]]; then
  exit 0
fi
AUTH_SECRET=$(gcloud secrets versions access latest --secret=tclothes-auth-secret --project="$PROJECT")
NEXTAUTH_URL=$(gcloud secrets versions access latest --secret=tclothes-nextauth-url --project="$PROJECT")
docker rm -f tclothes || true
docker run -d --name tclothes --restart unless-stopped --network tclothes-public -v /data:/data \
  -e DATABASE_PATH=/data/tclothes.db -e AUTH_SECRET="$AUTH_SECRET" \
  -e NEXTAUTH_SECRET="$AUTH_SECRET" -e NEXTAUTH_URL="$NEXTAUTH_URL" \
  -e AUTH_URL="$NEXTAUTH_URL" -e AUTH_TRUST_HOST=true \
  "$IMAGE"
PULL
chmod +x /usr/local/bin/pull-tclothes-latest

cat >/etc/systemd/system/tclothes-pull.service <<'UNIT'
[Unit]
Description=Pull and run the latest TClothes image
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/pull-tclothes-latest
UNIT

cat >/etc/systemd/system/tclothes-pull.timer <<'TIMER'
[Unit]
Description=Check Artifact Registry for a new TClothes image

[Timer]
OnBootSec=120s
OnUnitActiveSec=60s
Persistent=true
Unit=tclothes-pull.service

[Install]
WantedBy=timers.target
TIMER

systemctl daemon-reload
systemctl enable --now tclothes-pull.timer
