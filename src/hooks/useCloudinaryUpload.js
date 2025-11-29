import { useState } from 'react';

/**
 * Custom hook for uploading images to Cloudinary
 * Supports both unsigned (simple) and signed (secure) upload modes.
 * 
 * For unsigned: requires REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET in .env
 * For signed: requires a backend endpoint at /api/cloudinary/signature that returns { signature, timestamp, api_key, cloud_name, upload_preset }
 */
export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Generic timeout wrapper for fetch
  const fetchWithTimeout = async (resource, options = {}, timeoutMs = 15000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(resource, { ...options, signal: controller.signal });
      return response;
    } finally {
      clearTimeout(id);
    }
  };

  const getUploadSignature = async () => {
    try {
      // Request signature from backend (signed upload mode)
      const timestamp = Math.floor(Date.now() / 1000);
      const response = await fetchWithTimeout('/api/cloudinary/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp })
      }, 2500); // fail fast; we'll fall back to unsigned upload

      if (!response.ok) {
        throw new Error(`Failed to get signature: ${response.statusText}`);
      }

      const data = await response.json();
      if (data?.signature) {
        console.log('Got upload signature from backend:', { timestamp: data.timestamp, signature: data.signature.slice(0, 10) + '...' });
      } else {
        throw new Error('Signature payload missing required fields');
      }
      return data;
    } catch (err) {
      console.error('Error fetching upload signature:', err);
      // Do not set a blocking error here; we'll fall back to unsigned mode.
      return null;
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    // Flip uploading early so UI can react even if we fail fast
    setUploading(true);
    setError(null);

    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError('Cloudinary config missing. Check .env.local');
      setUploading(false);
      return null;
    }

    // Enforce 10MB limit (align with UI copy)
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError('Image too large. Max size is 10MB.');
      setUploading(false);
      return null;
    }


    try {
      console.log('Uploading to Cloudinary', { cloudName, uploadPreset, fileName: file.name });
      
      // Try signed upload first (backend signature)
      let signatureData = null;
      try {
        signatureData = await getUploadSignature();
      } catch (err) {
        console.warn('Signed upload not available, falling back to unsigned:', err.message);
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      // If signed upload available, add signature and timestamp
      if (signatureData) {
        formData.append('signature', signatureData.signature);
        formData.append('timestamp', signatureData.timestamp);
        formData.append('api_key', signatureData.api_key);
        console.log('Using signed upload');
      } else {
        console.log('Using unsigned upload');
      }

      const response = await fetchWithTimeout(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        },
        30000 // 30s timeout
      );

      const text = await response.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        // not JSON
      }

      if (!response.ok) {
        const errMsg = `Upload failed: ${response.status} ${response.statusText}`;
        console.error(errMsg, { status: response.status, body: data || text });
        setError(data?.error?.message || errMsg || text);
        setUploading(false);
        return null;
      }

      setUploading(false);
      console.log('Cloudinary upload success', data);
      return data.secure_url; // Return the secure HTTPS URL
    } catch (err) {
      console.error('Cloudinary upload error', err);
      if (err?.name === 'AbortError') {
        setError('Upload timed out. Please check your internet connection and try again.');
      } else {
        setError(err.message || String(err));
      }
      setUploading(false);
      return null;
    }
  };

  const uploadMultiple = async (files) => {
    const urls = [];
    for (const file of files) {
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    return urls;
  };

  return { uploadImage, uploadMultiple, uploading, error };
};

