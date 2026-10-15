#!/usr/bin/env node
/**
 * Import the three AI-generated AURA fight posters already reviewed/uploaded
 * to Metricool as the cover slide in the existing five-slide carousel packs.
 * This script uses only trusted CDN URLs defined in data/tiktok-ai-covers.json.
 * It does not publish to TikTok or change any external content.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const configPath = 'data/tiktok-ai-covers.json';
const manifestPath = 'public/news/tiktok/manifest.json';
const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

if (!Array.isArray(config.images) || config.images.length !== 3) {
  throw new Error('Expected exactly three approved AI art sources.');
}
const slugs = new Set();
for (const source of config.images) {
  if (!/^[a-z0-9-]+$/.test(source.packId) || slugs.has(source.packId)) {
    throw new Error('Invalid or repeated social pack ID.');
  }
  slugs.add(source.packId);
  const url = new URL(source.url);
  if (url.protocol !== 'https:' || url.hostname !== 'static.metricool.com'
      || !url.pathname.startsWith('/planner/202610/7438814-file-')
      || !url.pathname.endsWith('.png')) {
    throw new Error('Untrusted social image URL: ' + source.packId);
  }
  const pack = manifest.packs.find(p => p.id === source.packId);
  if (!pack || pack.media.length !== 5) throw new Error('Missing five-slide pack: ' + source.packId);

  const response = await fetch(url, {
    headers: {'User-Agent': 'AuraFightClubEditorial/1.0'},
    redirect: 'follow',
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error('Could not import ' + source.packId + ': HTTP ' + response.status);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 100_000 || bytes.length > 12_000_000) throw new Error('Unexpected cover size: ' + source.packId);
  const image = sharp(bytes, {failOn: 'error'});
  const metadata = await image.metadata();
  if (!['png', 'jpeg'].includes(metadata.format) || metadata.width < 600 || metadata.height < 900) {
    throw new Error('Invalid image dimensions or format: ' + source.packId);
  }

  const destination = path.join('public/news/tiktok', source.packId, '01.jpg');
  await image.resize(1080,1920,{fit:'cover',position:'centre'}).jpeg({quality:88,mozjpeg:true}).toFile(destination);
  pack.coverArt = {
    type:'AI-generated editorial illustration',
    representation:'Illustration of named fighters; not a real event photograph or official fight poster.',
    disclosure:'AI-generated image',
    originalAsset:'Canva AURA Fight Club library and Metricool TikTok draft'
  };
  console.log('Updated ' + destination + ' from AI-generated cover in Metricool.');
}
await fs.writeFile(manifestPath, JSON.stringify(manifest,null,2)+'\n');
console.log('All three AI covers imported into existing site carousel packs.');
