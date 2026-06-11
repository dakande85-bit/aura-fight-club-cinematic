import JSZip from 'jszip';

export const config = {
  api: {
    bodyParser: false,
  },
};

const DEFAULT_OWNER = 'dakande85-bit';
const DEFAULT_REPO = 'aura-fight-club-cinematic';
const DEFAULT_BRANCH = 'main';
const ALLOWED_PREFIXES = ['/assets/aura-scroll/', '/campaign/', '/assets/fight-club/'];

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload, null, 2));
}

function getBoundary(contentType) {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
  return match ? match[1] || match[2] : null;
}

async function readRequestBuffer(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function parseMultipart(buffer, boundary) {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const parts = [];
  let cursor = buffer.indexOf(boundaryBuffer);

  while (cursor !== -1) {
    cursor += boundaryBuffer.length;
    if (buffer[cursor] === 45 && buffer[cursor + 1] === 45) break;
    if (buffer[cursor] === 13 && buffer[cursor + 1] === 10) cursor += 2;

    const nextBoundary = buffer.indexOf(boundaryBuffer, cursor);
    if (nextBoundary === -1) break;

    let part = buffer.slice(cursor, nextBoundary);
    if (part.length >= 2 && part[part.length - 2] === 13 && part[part.length - 1] === 10) {
      part = part.slice(0, -2);
    }

    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd !== -1) {
      const headerText = part.slice(0, headerEnd).toString('utf8');
      const body = part.slice(headerEnd + 4);
      const headers = Object.fromEntries(
        headerText.split('\r\n').map((line) => {
          const idx = line.indexOf(':');
          if (idx === -1) return [line.toLowerCase(), ''];
          return [line.slice(0, idx).toLowerCase(), line.slice(idx + 1).trim()];
        })
      );
      const disposition = headers['content-disposition'] || '';
      const nameMatch = /name="([^"]+)"/i.exec(disposition);
      const filenameMatch = /filename="([^"]*)"/i.exec(disposition);
      parts.push({
        name: nameMatch ? nameMatch[1] : '',
        filename: filenameMatch ? filenameMatch[1] : '',
        contentType: headers['content-type'] || 'application/octet-stream',
        data: body,
      });
    }
    cursor = nextBoundary;
  }
  return parts;
}

function normalizeZipPath(path) {
  return String(path || '').replace(/^\/+/, '');
}

function isAllowedPublicPath(publicPath) {
  return ALLOWED_PREFIXES.some((prefix) => publicPath.startsWith(prefix));
}

function publicPathToRepoPath(publicPath) {
  if (!publicPath || typeof publicPath !== 'string') throw new Error('Missing replacement path');
  if (publicPath.includes('..')) throw new Error(`Unsafe path rejected: ${publicPath}`);
  if (publicPath.startsWith('/assets/')) return `public${publicPath}`;
  if (publicPath.startsWith('/campaign/')) return `public${publicPath}`;
  throw new Error(`Unsupported public path: ${publicPath}`);
}

function inferPackFilePath(replacement) {
  if (replacement.packFilePath) return normalizeZipPath(replacement.packFilePath);
  const suggested = replacement.suggestedReplacementPath || replacement.replace || '';
  const suggestedName = suggested.split('/').filter(Boolean).pop();
  if (suggestedName) return `media/${suggestedName}`;
  if (replacement.uploadedFileName) return `media/${replacement.uploadedFileName}`;
  return '';
}

function validateManifest(manifest, zip) {
  const errors = [];
  const warnings = [];
  const replacements = Array.isArray(manifest?.replacements) ? manifest.replacements : [];

  if (!manifest || typeof manifest !== 'object') errors.push('Manifest is missing or invalid');
  if (!Number.isFinite(Number(manifest?.replacementCount)) || Number(manifest.replacementCount) <= 0) {
    errors.push('replacementCount must be greater than 0');
  }
  if (!replacements.length) errors.push('Manifest replacements array is empty');

  const normalized = replacements.map((replacement, index) => {
    const suggestedReplacementPath = replacement.suggestedReplacementPath;
    const packFilePath = inferPackFilePath(replacement);
    const repoPath = suggestedReplacementPath ? publicPathToRepoPath(suggestedReplacementPath) : '';

    if (replacement.readyForPublish !== true) errors.push(`Replacement ${index + 1} is not readyForPublish`);
    if (!suggestedReplacementPath) errors.push(`Replacement ${index + 1} is missing suggestedReplacementPath`);
    else if (!isAllowedPublicPath(suggestedReplacementPath)) {
      errors.push(`Replacement ${index + 1} path is outside allowed prefixes: ${suggestedReplacementPath}`);
    }
    if (!packFilePath) errors.push(`Replacement ${index + 1} is missing packFilePath`);
    else if (!zip.file(packFilePath)) errors.push(`Replacement ${index + 1} media file missing from ZIP: ${packFilePath}`);
    if (replacement.type && !['image', 'poster', 'video', 'frame'].includes(String(replacement.type))) {
      warnings.push(`Replacement ${index + 1} has unusual type: ${replacement.type}`);
    }
    return { ...replacement, packFilePath, repoPath };
  });

  return { errors, warnings, replacements: normalized };
}

async function githubRequest(path, options = {}) {
  const owner = process.env.GITHUB_OWNER || DEFAULT_OWNER;
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const error = new Error('Missing GITHUB_TOKEN environment variable');
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = { raw: text }; }

  if (!response.ok) {
    const error = new Error(payload?.message || `GitHub request failed: ${response.status}`);
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function createGitCommit(replacements, zip) {
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH;
  const ref = await githubRequest(`/git/ref/heads/${branch}`);
  const parentSha = ref.object.sha;
  const parentCommit = await githubRequest(`/git/commits/${parentSha}`);
  const baseTreeSha = parentCommit.tree.sha;
  const tree = [];

  for (const replacement of replacements) {
    const file = zip.file(replacement.packFilePath);
    const mediaBuffer = Buffer.from(await file.async('uint8array'));
    const blob = await githubRequest('/git/blobs', {
      method: 'POST',
      body: JSON.stringify({ content: mediaBuffer.toString('base64'), encoding: 'base64' }),
    });
    tree.push({ path: replacement.repoPath, mode: '100644', type: 'blob', sha: blob.sha });
  }

  const newTree = await githubRequest('/git/trees', {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTreeSha, tree }),
  });
  const commit = await githubRequest('/git/commits', {
    method: 'POST',
    body: JSON.stringify({ message: 'feat: publish cinematic replacement pack', tree: newTree.sha, parents: [parentSha] }),
  });
  await githubRequest(`/git/refs/heads/${branch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return { branch, commitSha: commit.sha, filesWritten: tree.map((entry) => entry.path) };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { success: false, error: 'Method not allowed. Use POST with multipart field "pack".' });
  }

  try {
    const boundary = getBoundary(req.headers['content-type']);
    if (!boundary) return json(res, 400, { success: false, error: 'Missing multipart boundary. Upload a ZIP using field name "pack".' });

    const buffer = await readRequestBuffer(req);
    const parts = parseMultipart(buffer, boundary);
    const packPart = parts.find((part) => part.name === 'pack');
    if (!packPart || !packPart.data?.length) return json(res, 400, { success: false, error: 'Missing pack file.' });

    const zip = await JSZip.loadAsync(packPart.data);
    const manifestFile = zip.file('replacement-manifest.json');
    if (!manifestFile) return json(res, 422, { success: false, error: 'replacement-manifest.json missing from ZIP' });

    let manifest;
    try { manifest = JSON.parse(await manifestFile.async('string')); }
    catch (err) { return json(res, 422, { success: false, error: `replacement-manifest.json is invalid JSON: ${err.message}` }); }

    const { errors, warnings, replacements } = validateManifest(manifest, zip);
    if (errors.length) return json(res, 422, { success: false, error: 'Replacement pack validation failed', errors, warnings });

    const result = await createGitCommit(replacements, zip);
    return json(res, 200, {
      success: true,
      ...result,
      manifestSummary: { brand: manifest.brand, page: manifest.page, scene: manifest.scene, replacementCount: replacements.length },
      warnings,
      note: 'Media files published only. ScrollFilm.jsx and CampaignScrollFilm.jsx were not modified.',
    });
  } catch (err) {
    return json(res, err.statusCode || 500, { success: false, error: err.message || 'Publish failed', details: err.payload || null });
  }
}
