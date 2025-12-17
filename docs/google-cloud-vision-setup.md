# Google Cloud Vision API Setup Guide

This guide will help you set up Google Cloud Vision API for OCR (Optical Character Recognition) in the GTMS application.

## Prerequisites

- Google Cloud account (create one at https://console.cloud.google.com)
- Billing enabled on your Google Cloud project (required for Vision API)
- Command-line access or browser

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name (e.g., "gtms-production")
5. Click "CREATE"
6. Wait for the project to be created, then select it

## Step 2: Enable Cloud Vision API

1. In your project, go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for "Cloud Vision API"
3. Click on "Cloud Vision API"
4. Click "ENABLE"
5. Wait for the API to be enabled (usually takes a few seconds)

## Step 3: Enable Billing (Required)

**Important**: Vision API requires billing to be enabled, but offers a generous free tier:
- **Free Tier**: First 1,000 OCR requests per month = FREE
- **Paid Tier**: $1.50 per 1,000 requests after free tier

To enable billing:
1. Go to [Billing](https://console.cloud.google.com/billing)
2. Link a billing account to your project
3. Add a payment method (credit card)

**Set up billing alerts** (recommended):
1. Go to [Billing > Budgets & alerts](https://console.cloud.google.com/billing/budgets)
2. Create a budget (e.g., $10/month)
3. Set alert thresholds (50%, 90%, 100%)

## Step 4: Create a Service Account

Service accounts provide secure, server-to-server authentication:

1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "CREATE CREDENTIALS" → "Service account"
3. Enter service account details:
   - **Name**: `gtms-ocr-service`
   - **Description**: `Service account for GTMS OCR functionality`
4. Click "CREATE AND CONTINUE"
5. Grant permissions:
   - Role: "Cloud Vision AI Service Agent"
   - Click "CONTINUE"
6. Click "DONE"

## Step 5: Generate and Download JSON Key

1. In the Service Accounts list, find your newly created account
2. Click the three dots (⋮) on the right → "Manage keys"
3. Click "ADD KEY" → "Create new key"
4. Select "JSON" format
5. Click "CREATE"
6. **IMPORTANT**: The JSON file will automatically download. Save it securely!
   - **DO NOT commit this file to Git**
   - **DO NOT share this file publicly**
   - Store it in a secure location (e.g., `~/.google-cloud/gtms-service-account.json`)

## Step 6: Configure GTMS Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Google Cloud credentials:
   ```bash
   # Google Cloud Vision API
   GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-service-account-key.json
   ```

3. Find your project ID:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Click on the project selector at the top
   - Your project ID is shown next to the project name

4. Set the service account key path:
   ```bash
   # Example for local development
   GOOGLE_APPLICATION_CREDENTIALS=/home/youruser/.google-cloud/gtms-service-account.json
   ```

## Step 7: Verify Setup

Test that your API credentials work:

```bash
# Install Google Cloud SDK (if not already installed)
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize gcloud
gcloud init

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Test Vision API
gcloud ml vision detect-text gs://cloud-samples-data/vision/ocr/sign.jpg
```

## Step 8: Vercel Deployment Configuration
Perfect! Since you're using Vercel, here's exactly what you need to do:

  For Local Development (Now)

  Your .env.local file should have:

  GOOGLE_CLOUD_PROJECT_ID=your-actual-project-id
  GOOGLE_APPLICATION_CREDENTIALS=/home/okcee/.google-cloud/gtms-service-account.json

  Yes, this is the full path on your local machine to the JSON key file you downloaded from Google Cloud.

  For Vercel Production (Later)

  When you're ready to deploy, you'll need to add environment variables in Vercel:

  Step 1: Encode your JSON file to base64

  cat /home/okcee/.google-cloud/gtms-service-account.json | base64 -w 0

  This will output a very long string. Copy it.

  Step 2: Add to Vercel Dashboard

  1. Go to your project in https://vercel.com/dashboard
  2. Settings → Environment Variables
  3. Add these variables:

  | Variable Name                     | Value                               |
  |-----------------------------------|-------------------------------------|
  | GOOGLE_CLOUD_PROJECT_ID           | Your GCP project ID (same as local) |
  | GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON | The base64 string from Step 1       |

  That's it! The code in vision-client.ts I just updated will automatically:
  - Use the file path when running locally
  - Use the base64-encoded JSON when running on Vercel

If successful, you should see detected text in the output.
