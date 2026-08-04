import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const checkedExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.html', '.css', '.sql', '.yml', '.yaml']);
const ignoredDirs = new Set(['node_modules', 'dist', '.git']);

const failures = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    if (entry.isFile() && checkedExtensions.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

const files = await walk(root);

for (const file of files) {
  const relative = rel(file);
  if (relative === 'scripts/security-check.mjs') continue;
  const source = await readFile(file, 'utf8');

  if (/SUPABASE_SERVICE_ROLE_KEY|service[_-]?role/i.test(source) && !relative.startsWith('api/') && !relative.startsWith('scripts/') && !relative.startsWith('supabase/migrations/') && !relative.includes('.env.example') && !relative.includes('README')) {
    failures.push(`${relative}: service-role reference outside server/docs context`);
  }

  if (/supplierCommandData|activeShopifyProducts|shopProducts|preorderProducts/.test(source)) {
    failures.push(`${relative}: imports or references a retired catalogue`);
  }

  if (/mailto:/i.test(source) && !relative.startsWith('src/pages/AdminSuppliers.jsx')) {
    failures.push(`${relative}: mailto link remains in customer-reachable code`);
  }

  if (/setSubmitted\(true\)/.test(source) && !/await submitWaitlist/.test(source)) {
    failures.push(`${relative}: possible fake waitlist success state`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Security/import scan passed.');
