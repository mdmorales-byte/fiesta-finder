/**
 * Vercel Serverless Function: Generate Cloudinary signed upload signature
 * 
 * Endpoint: /api/cloudinary/signature
 * Method: POST
 * Body: { timestamp: number }
 * Response: { signature, timestamp, upload_preset, cloud_name, api_key }
 */

const crypto = require('crypto');

export default function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timestamp } = req.body;

    if (!timestamp) {
      return res.status(400).json({ error: 'Missing timestamp' });
    }

    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudinaryCloudName || !cloudinaryApiSecret || !uploadPreset) {
      console.error('Cloudinary config missing in Vercel env');
      return res.status(500).json({ error: 'Server Cloudinary config incomplete' });
    }

    // Build the string to sign: upload_preset=...&timestamp=...
    const stringToSign = `upload_preset=${uploadPreset}&timestamp=${timestamp}`;

    // Generate SHA-1 signature
    const signature = crypto
      .createHmac('sha1', cloudinaryApiSecret)
      .update(stringToSign)
      .digest('hex');

    // Return params needed by client for signed upload
    res.json({
      signature,
      timestamp,
      upload_preset: uploadPreset,
      cloud_name: cloudinaryCloudName,
      api_key: process.env.CLOUDINARY_API_KEY
    });
  } catch (err) {
    console.error('Error generating upload signature:', err);
    res.status(500).json({ error: err.message });
  }
}
