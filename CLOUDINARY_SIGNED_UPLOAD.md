# Cloudinary Signed Upload Setup

This guide explains how to use **signed uploads** for better security. Signed uploads require your backend to generate a signature, preventing unauthorized uploads.

## Why Signed Uploads?

- **Unsigned uploads**: Anyone with your cloud name and preset name can upload. Good for public demos, not for production.
- **Signed uploads**: Your backend signs each upload request with your Cloudinary API secret. Only authorized requests succeed. This is production-ready.

## How It Works

1. Frontend calls backend endpoint `/api/cloudinary/signature` with a timestamp.
2. Backend generates an HMAC-SHA1 signature using your Cloudinary API secret.
3. Backend returns the signature, timestamp, and other params to the frontend.
4. Frontend uses the signature in the Cloudinary upload POST, proving authorization.
5. Cloudinary validates the signature and accepts the upload.

## Setup Steps

### 1. Get Cloudinary API Credentials

1. Sign into your Cloudinary Dashboard: https://cloudinary.com/console
2. Go to Settings → API Keys.
3. Copy:
   - **API Key** (visible)
   - **API Secret** (click to reveal; keep secret!)
4. Also note your **Cloud Name** (from top-left or Settings → Account).

### 2. Update Backend `.env`

Add your credentials to `my-proj/backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=dseje3kxc
CLOUDINARY_API_KEY=your_api_key_from_step_1
CLOUDINARY_API_SECRET=your_api_secret_from_step_1
CLOUDINARY_UPLOAD_PRESET=fiesta_finder
```

**⚠️ Important**: Never commit `.env` with real credentials. Use `.env.example` as a template and keep `.env` in `.gitignore`.

### 3. Restart Backend

```bash
cd my-proj/backend
npm start
```

The backend will now serve the `/api/cloudinary/signature` endpoint.

### 4. Test Locally

1. Start the frontend dev server (if not already running):
   ```bash
   cd my-proj
   npm start
   ```
   It will run on `http://localhost:3000`.

2. Go to Admin → Add Festival (or Edit Festival).
3. Select an image and click "Add Festival" / "Update Festival".
4. Open DevTools → Console. You should see:
   - "Got upload signature from backend: ..."
   - "Using signed upload"
   - "Cloudinary upload success" with returned `secure_url`

5. If the festival is added and images appear, signed uploads are working! ✅

### 5. Deploy to Vercel

1. Go to your Vercel project dashboard.
2. Settings → Environment Variables.
3. Add:
   ```
   CLOUDINARY_CLOUD_NAME=dseje3kxc
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_UPLOAD_PRESET=fiesta_finder
   ```

4. Redeploy the backend and frontend so they pick up the new env vars:
   ```bash
   git push
   ```
   Vercel will auto-deploy.

5. Test the deployed site by uploading an image to a festival.

### 6. Optional: Customize Upload Preset

Your Cloudinary preset determines what files can be uploaded and what transformations are applied:

1. Dashboard → Upload → Upload Presets.
2. Find `fiesta_finder` and click Edit.
3. Configure:
   - **Signing Mode**: Can stay as "Signed" or "Unsigned" (backend signs it for you).
   - **Allowed file types**: Set to images only if needed (PNG, JPG, GIF).
   - **Folder**: Set a folder like `fiesta-finder/festivals` to organize uploads.
   - **Transformations**: Add auto-crop, quality optimization, etc.
4. Save.

## Troubleshooting

### "Failed to get signature from backend" Error

- Backend `/api/cloudinary/signature` endpoint not reachable.
- Check: Is the backend running on `http://localhost:4000` (dev) or your deployed URL?
- Check backend logs for errors. Make sure `CLOUDINARY_API_SECRET` is set in backend `.env`.

### "Upload failed: 401 Unauthorized" (Cloudinary)

- Backend signature is invalid (wrong API secret, or timestamp mismatch).
- Verify `CLOUDINARY_API_SECRET` in backend `.env` is correct (copy from Cloudinary dashboard, no extra spaces).
- Check backend logs for "Error generating upload signature".

### Images Uploaded But Not Persisted

- Images are successfully uploaded to Cloudinary, but the festival data (with image URLs) is not saved to MongoDB.
- Check that the festival is being saved in AdminContext or your backend festival route.
- Verify Cloudinary `secure_url` is being stored in the festival's `imagePreviews` array.

### Upload Works Locally But Not on Vercel

- Env vars not set on Vercel, or not redeployed after setting them.
- Go to Vercel dashboard → Settings → Environment Variables and verify `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, etc. are present.
- Redeploy by pushing a new commit or clicking "Redeploy" in Vercel dashboard.

## How to Switch Back to Unsigned Uploads (Simple Mode)

If you want to revert to unsigned uploads for development:

1. In `my-proj/frontend/src/hooks/useCloudinaryUpload.js`, remove the `getUploadSignature()` call.
2. Just use unsigned preset (already configured in your Cloudinary dashboard).
3. The hook will fall back to unsigned automatically if the backend is down.

## Architecture Summary

```
Frontend (React)
  ↓ (requests signature)
Backend (Express)
  ↓ (has CLOUDINARY_API_SECRET)
Cloudinary API (/v1_1/dseje3kxc/image/upload)
  ↓ (uploads file)
Cloudinary CDN
  ↓ (returns secure_url)
Frontend (stores secure_url in festival data)
```

Signed uploads ensure the backend controls who can upload, using the API secret that never leaves your server.
