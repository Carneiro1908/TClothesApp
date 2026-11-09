variable "project_id" {
  type        = string
  description = "Google Cloud project ID"
}
variable "region" {
  type    = string
  default = "europe-west1"
}
variable "zone" {
  type    = string
  default = "europe-west1-b"
}
variable "repository_id" {
  type    = string
  default = "tclothes"
}
variable "machine_type" {
  type    = string
  default = "e2-small"
}
variable "data_disk_size_gb" {
  type    = number
  default = 20
}
