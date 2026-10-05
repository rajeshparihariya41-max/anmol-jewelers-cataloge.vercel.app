// ─── Live Catalog API (Vercel serverless function) ─────────────────────
// File: api/live-catalog.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PUBLISH_TOKEN = process.env.LIVE_PUBLISH_TOKEN;
const JSON_PUBLIC_ID = 'anmol-catalog/live-catalog.json';
const PHOTO_FOLDER = 'anmol-catalog/photos';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-publish-token');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET - Browser se seedha taaza JSON
  if (req.method === 'GET') {
    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloud) return res.status(500).json({ error: 'Not configured' });
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.redirect(
      307,
      `https://res.cloudinary.com/${cloud}/raw/upload/${JSON_PUBLIC_ID}?t=${Date.now()}`
    );
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers['x-publish-token'];
  if (!PUBLISH_TOKEN || token !== PUBLISH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized - Token galat hai' });
  }

  const body = req.body || {};
  try {
    // Photo upload
    if (body.action === 'uploadPhoto') {
      const { key, base64 } = body;
      if (!key || !base64) return res.status(400).json({ error: 'key/base64 missing' });
      const safeKey = String(key).replace(/[^a-zA-Z0-9_-]/g, '_');
      const mimeType = String(body.mimeType || 'image/jpeg').toLowerCase();
      const validMime = /^image\/[a-z0-9.+-]+$/.test(mimeType) ? mimeType : 'image/jpeg';
      const result = await cloudinary.uploader.upload(`data:${validMime};base64,${base64}`, {
        public_id: `${PHOTO_FOLDER}/${safeKey}`,
        resource_type: 'image',
        overwrite: true,
        invalidate: true,
      });
      return res.status(200).json({ url: result.secure_url });
    }

    // Live JSON publish
    if (body.action === 'publish') {
      const json = JSON.stringify(body.data ?? {});
      const result = await cloudinary.uploader.upload(
        `data:application/json;base64,${Buffer.from(json, 'utf8').toString('base64')}`,
        { public_id: JSON_PUBLIC_ID, resource_type: 'raw', overwrite: true, invalidate: true }
      );
      return res.status(200).json({ jsonUrl: result.secure_url, updatedAt: body.data?.updatedAt ?? null });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    console.error('[live-catalog] error', e);
    return res.status(500).json({ error: e?.message || 'Upload failed' });
  }
}
