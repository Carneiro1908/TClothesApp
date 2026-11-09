# GCP infrastructure and deployment

This setup runs the Next.js app on one Compute Engine VM and stores its SQLite database on a separately attached persistent disk. Terraform creates the VM, disk, Artifact Registry repository, firewall rule, VM service account, and app secrets.

## Current deployment

The project `tclothes-prod-20261109` is provisioned in `europe-west1-b`. The VM has static IP `35.240.47.140`. Update the DuckDNS A record for `aquiles-design` to this address; it still points to the previous IP. Caddy will obtain the HTTPS certificate once DNS resolves to this VM. The SQLite database and generated sample products are on the persistent disk. The admin username is `admin`; its generated password is stored in Secret Manager as `tclothes-admin-password` and can be retrieved by an authorized account with `gcloud secrets versions access latest --secret=tclothes-admin-password --project=tclothes-prod-20261109`.

Workload Identity Federation is configured for the GitHub repository. The deploy service account has `roles/artifactregistry.writer` only on the app repository. GitHub Actions publishes a `latest` image; a VM systemd timer checks for updates every minute and restarts the app without granting the CI account SSH or VM administration access.

## Provision infrastructure

1. Install Terraform and authenticate with `gcloud auth application-default login`. Link an open billing account to the project first; GCP refuses to enable Compute Engine, Artifact Registry, and Secret Manager APIs without billing.
2. Copy `terraform.tfvars.example` to `terraform.tfvars`, set `project_id`, and run:

   ```sh
   cd infra
   terraform init
   terraform apply
   ```

3. Add secret values (use the final public URL for `NEXTAUTH_URL`):

   ```sh
   printf %s 'a-long-random-secret' | gcloud secrets versions add tclothes-auth-secret --data-file=-
   printf %s 'https://your-domain.example' | gcloud secrets versions add tclothes-nextauth-url --data-file=-
   ```

4. Add GitHub repository secrets: `GCP_PROJECT_ID=tclothes-prod-20261109`, `GCP_WORKLOAD_IDENTITY_PROVIDER=projects/462165420055/locations/global/workloadIdentityPools/github/providers/github`, and `GCP_DEPLOY_SERVICE_ACCOUNT=tclothes-github-deploy@tclothes-prod-20261109.iam.gserviceaccount.com`. The pool/provider and service account already exist and trust only `Carneiro1908/TClothesApp` on `main`.
5. Push to `main` or run **Deploy to Google Cloud** manually in GitHub Actions.

The VM image installs the Google Cloud CLI on first boot. The VM service account has image pull access and access to the app secrets. New images reach the VM within about one minute after a successful workflow run.

## Important application setup

The `better-sqlite3` runtime dependency and its TypeScript declarations are included in `package.json` and `package-lock.json`.

This is a single-VM deployment. The SQLite data survives VM replacement because it lives on a separately managed disk. Take regular disk snapshots/backups before production use.
