const fs = require('fs');
const path = require('path');

// Simple parser for .env.local values
function readEnv(file) {
  try {
    const txt = fs.readFileSync(file, 'utf8');
    const lines = txt.split(/\r?\n/);
    const out = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      out[key] = val;
    }
    return out;
  } catch (err) {
    console.error('Unable to read .env.local:', err.message);
    return {};
  }
}

(async () => {
  const repoRoot = path.join(__dirname, '..');
  const envFile = path.join(repoRoot, '.env.local');
  const env = readEnv(envFile);
  const cloudName = env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error('Missing Cloudinary config in .env.local');
    process.exit(1);
  }

  console.log('Using Cloud Name:', cloudName);
  console.log('Using Upload Preset:', uploadPreset);

  // Use fetch + FormData (Node 18+)
  try {
    const FormData = global.FormData || (await import('formdata-node')).FormData;
    const fetch = global.fetch || (await import('node-fetch')).default;

    // Ensure there's a local sample image to upload. If not, create a tiny 1x1 PNG.
    const samplePath = path.join(repoRoot, 'scripts', 'sample.png');
    if (!fs.existsSync(samplePath)) {
      console.log('Creating sample image at', samplePath);
      const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='; // 1x1 PNG
      fs.writeFileSync(samplePath, Buffer.from(base64, 'base64'));
    }

    const form = new FormData();
    // Read the file into memory and send as data URL (Cloudinary accepts base64 data URLs)
    const fileBuffer = fs.readFileSync(samplePath);
    const dataUrl = 'data:image/png;base64,' + fileBuffer.toString('base64');
    form.append('file', dataUrl);
    form.append('upload_preset', uploadPreset);

    console.log('Sending upload request to Cloudinary with local file (base64 data URL)...');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form
    });

    const text = await res.text();
    console.log('Response status:', res.status, res.statusText);
    console.log('Response body:', text);

    try {
      const json = JSON.parse(text);
      if (json.error) {
        console.error('Cloudinary error object:', json.error);
        process.exit(2);
      }
      if (json.secure_url) {
        console.log('Upload successful! secure_url:', json.secure_url);
        process.exit(0);
      }
    } catch (e) {
      // not JSON
    }

    process.exit(res.ok ? 0 : 3);
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(4);
  }
})();
