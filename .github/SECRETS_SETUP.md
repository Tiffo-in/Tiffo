# GitHub Actions — Secrets & Setup Guide

All secrets go in **GitHub → Settings → Secrets and variables → Actions → Repository secrets**.

---

## 🔐 Required Secrets

### Google Cloud Platform

| Secret Name | Description | How to Get |
|---|---|---|
| `GCP_PROJECT_ID` | Your GCP Project ID | GCP Console → Project Settings |
| `GCP_SA_KEY` | Service Account JSON key (base64 not needed — paste raw JSON) | See instructions below |

### Backend Runtime Secrets (injected into Cloud Run via GCP Secret Manager)

> These are referenced in `cd.yml` via `secrets:` block. Add them to **GCP Secret Manager**, not just GitHub.

| Secret Name | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Frontend Build-Time Variables

| Secret Name | Description |
|---|---|
| `VITE_API_URL` | Backend Cloud Run URL (e.g. `https://tiffo-xyz.run.app`) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JS API key |

### Optional (for CI test runs)

| Secret Name | Description |
|---|---|
| `TEST_MONGODB_URI` | Separate test database URI (optional — CI uses a mock if absent) |

---

## 🛠️ GCP Service Account Setup

Run these commands once in your GCP project:

```bash
# 1. Create a service account
gcloud iam service-accounts create github-actions-sa \
  --display-name="GitHub Actions CI/CD"

# 2. Grant required roles
PROJECT_ID=$(gcloud config get-value project)
SA_EMAIL="github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"

# 3. Create and download the key
gcloud iam service-accounts keys create gcp-key.json \
  --iam-account=$SA_EMAIL

# 4. Copy the contents of gcp-key.json into the GCP_SA_KEY GitHub secret
cat gcp-key.json

# 5. Delete the local key file
rm gcp-key.json
```

---

## 🏗️ Artifact Registry Setup (one-time)

```bash
gcloud artifacts repositories create tiffo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Tiffo Docker images"
```

---

## 🌿 Branch Strategy

| Branch | Workflow Triggered | Deploys? |
|---|---|---|
| Any PR → `main`/`develop` | `ci.yml` + `pr-checks.yml` | ❌ No |
| Push to `develop` | `ci.yml` | ❌ No |
| Push to `main` | `ci.yml` + `cd.yml` | ✅ Yes → Production |
