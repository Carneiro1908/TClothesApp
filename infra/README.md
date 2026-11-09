# GCP infrastructure and deployment

This setup runs the Next.js app on one Compute Engine VM and stores its SQLite database on a separately attached persistent disk. Terraform creates the VM, disk, Artifact Registry repository, firewall rule, VM service account, and two empty Secret Manager secrets. GitHub Actions builds and deploys each push to `main`.

## Provision infrastructure

1. Install Terraform and authenticate with `gcloud auth application-default login`.
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

4. Add GitHub repository secrets: `GCP_PROJECT_ID`, `GCP_WORKLOAD_IDENTITY_PROVIDER` (full provider resource name), and `GCP_DEPLOY_SERVICE_ACCOUNT` (service account email).
5. Configure Workload Identity Federation for this repository. Grant its deploy service account permission to push to the `tclothes` Artifact Registry repository and use IAP/OS Login to reach the VM (`roles/compute.instanceAdmin.v1`, `roles/compute.osAdminLogin`, `roles/iap.tunnelResourceAccessor`). Restrict the identity provider to this repository and the `main` branch.
6. Push to `main` or run **Deploy to Google Cloud** manually in GitHub Actions.

The VM image installs the Google Cloud CLI on first boot. The deploy service account needs access to Artifact Registry; the VM service account has image pull access and access to only the two app secrets. The first deploy can take a few minutes while startup completes. Open the Terraform `public_ip` output on port 80.

## Important application setup

The app's current `scripts/setup-db.ts` seeds a default admin account if `ADMIN_USERNAME` and `ADMIN_PASSWORD` are unset. After the first deploy, connect to the VM through IAP and run `sudo docker exec -e ADMIN_USERNAME='your-admin' -e ADMIN_PASSWORD='a-long-unique-password' tclothes npm run setup` once. Do not use its fallback password in production. The app requires the GitHub deploy service account to have `roles/artifactregistry.writer`, `roles/compute.instanceAdmin.v1`, `roles/compute.osAdminLogin`, and `roles/iap.tunnelResourceAccessor`; limit its Workload Identity Federation trust to this repository and `main`.

The source imports `better-sqlite3` but the current `package.json` and lockfile do not declare it. Add and commit that dependency and regenerated `package-lock.json` before the first workflow run; otherwise `npm ci` / the Docker build cannot complete. The local environment could not reach npm to resolve it.

This is a single-VM deployment. The SQLite data survives VM replacement because it lives on a separately managed disk. Take regular disk snapshots/backups before production use.
