terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = { source = "hashicorp/google", version = "~> 6.0" }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_project_service" "apis" {
  for_each           = toset(["compute.googleapis.com", "artifactregistry.googleapis.com", "secretmanager.googleapis.com"])
  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "app" {
  project       = var.project_id
  location      = var.region
  repository_id = var.repository_id
  description   = "TClothes application images"
  format        = "DOCKER"
  depends_on    = [google_project_service.apis]
}

resource "google_compute_disk" "data" {
  project = var.project_id
  name    = "tclothes-data"
  zone    = var.zone
  size    = var.data_disk_size_gb
  type    = "pd-balanced"
}

resource "google_compute_address" "public" {
  project = var.project_id
  name    = "tclothes-public"
  region  = var.region
}

resource "google_service_account" "vm" {
  project      = var.project_id
  account_id   = "tclothes-vm"
  display_name = "TClothes VM"
}

resource "google_project_iam_member" "vm_artifact_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.vm.email}"
}

resource "google_artifact_registry_repository_iam_member" "github_deployer_writer" {
  project    = var.project_id
  location   = var.region
  repository = google_artifact_registry_repository.app.repository_id
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:tclothes-github-deploy@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_secret_manager_secret" "auth_secret" {
  project   = var.project_id
  secret_id = "tclothes-auth-secret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret" "nextauth_url" {
  project   = var.project_id
  secret_id = "tclothes-nextauth-url"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_iam_member" "vm_auth_secret" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.auth_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.vm.email}"
}

resource "google_secret_manager_secret_iam_member" "vm_url_secret" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.nextauth_url.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.vm.email}"
}

resource "google_compute_instance" "app" {
  project      = var.project_id
  name         = "tclothes-app"
  zone         = var.zone
  machine_type = var.machine_type

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
      size  = 20
    }
  }
  attached_disk {
    source      = google_compute_disk.data.self_link
    device_name = "tclothes-data"
  }

  network_interface {
    network = "default"
    access_config {
      nat_ip = google_compute_address.public.address
    }
  }

  metadata_startup_script = file("${path.module}/startup.sh")
  service_account {
    email  = google_service_account.vm.email
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }
  tags       = ["tclothes-web"]
  depends_on = [google_project_service.apis]
}

resource "google_compute_firewall" "web" {
  project = var.project_id
  name    = "tclothes-web"
  network = "default"
  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["tclothes-web"]
}

resource "google_compute_firewall" "iap_ssh" {
  project = var.project_id
  name    = "tclothes-iap-ssh"
  network = "default"
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["tclothes-web"]
}

output "instance_name" { value = google_compute_instance.app.name }
output "instance_zone" { value = google_compute_instance.app.zone }
output "artifact_registry" { value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app.repository_id}" }
output "public_ip" { value = google_compute_address.public.address }
