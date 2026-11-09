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

cat >/usr/local/bin/deploy-tclothes <<'DEPLOY'
#!/bin/bash
set -euo pipefail
IMAGE="$1"
PROJECT=$(curl -fsH 'Metadata-Flavor: Google' http://metadata.google.internal/computeMetadata/v1/project/project-id)
gcloud auth configure-docker "$(echo "$IMAGE" | cut -d/ -f1)" --quiet
docker pull "$IMAGE"
docker rm -f tclothes || true
docker run -d --name tclothes --restart unless-stopped -p 80:3000 -v /data:/data \
  -e AUTH_SECRET="$(gcloud secrets versions access latest --secret=tclothes-auth-secret --project="$PROJECT")" \
  -e NEXTAUTH_SECRET="$(gcloud secrets versions access latest --secret=tclothes-auth-secret --project="$PROJECT")" \
  -e NEXTAUTH_URL="$(gcloud secrets versions access latest --secret=tclothes-nextauth-url --project="$PROJECT")" \
  "$IMAGE"
DEPLOY
chmod +x /usr/local/bin/deploy-tclothes
