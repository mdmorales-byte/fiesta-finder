# Cloudinary Setup for Image Uploads

## Quick Start

### 1. Create Cloudinary Account
1. Go to https://cloudinary.com/users/register/free (free tier = 25 GB storage)
2. Sign up and verify your email
3. After login, you'll see your dashboard

### 2. Get Your Credentials
1. Go to **Settings** → **API Keys**
2. Copy your **Cloud Name**
3. Go to **Upload** tab (Settings → Upload)
4. Scroll down to **Upload presets**
5. Click **Create unsigned** and name it `fiesta_finder`
6. Save the preset name

### 3. Add to `.env.local`
Create `.env.local` in `my-proj/` root (this file is ignored by git):

```
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
REACT_APP_CLOUDINARY_UPLOAD_PRESET=fiesta_finder
REACT_APP_SUPERADMIN_USER=superadmin
REACT_APP_SUPERADMIN_PASS=fiesta2025!
```

Replace `your_cloud_name_here` with your actual Cloud Name.

### 4. Restart Dev Server
```powershell
cd .\my-proj
npm start
```

### 5. Test Upload
- Go to `/admin/login`
- Login with `superadmin` / `fiesta2025!`
- Go to Dashboard → Add Festival (or Edit)
- Upload images — they should upload to Cloudinary now!

## What Changed
- **Before:** Images were stored as base64 in browser localStorage → doesn't work on Vercel
- **Now:** Images upload to Cloudinary cloud → works everywhere, even Vercel

## Security Notes
- `REACT_APP_CLOUDINARY_UPLOAD_PRESET` is public (it's in the browser bundle anyway)
- Use **unsigned upload presets** only (never expose API secrets in frontend code)
- Cloudinary free tier: 25 GB storage, unlimited bandwidth

## Troubleshooting
- **"Cloudinary config missing"**: Check `.env.local` exists and has the right values
- **Upload fails**: Verify Cloud Name and Upload Preset name are correct
- **Images don't appear**: Hard refresh browser (Ctrl+F5), check Cloudinary dashboard
