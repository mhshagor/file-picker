import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = new URL('..', import.meta.url);
const distDir = new URL('../dist/', import.meta.url);

function minifyJs(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\n)\s*\/\/.*(?=\n|$)/g, '$1')
    .replace(/\n+/g, '\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function minifyCss(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

async function ensureDir(pathUrl) {
  await mkdir(pathUrl, { recursive: true });
}

async function writeFileEnsuringDir(targetPathUrl, content) {
  await ensureDir(new URL('./', targetPathUrl));
  await writeFile(targetPathUrl, content, 'utf8');
}

async function main() {
  const jsPath = new URL('../asset/js/file-picker.js', import.meta.url);
  const cssPath = new URL('../asset/css/file-picker.css', import.meta.url);

  const [js, css] = await Promise.all([
    readFile(jsPath, 'utf8'),
    readFile(cssPath, 'utf8'),
  ]);

  await ensureDir(distDir);

  await writeFileEnsuringDir(new URL('file-picker.js', distDir), js);
  await writeFileEnsuringDir(new URL('file-picker.min.js', distDir), minifyJs(js));

  await writeFileEnsuringDir(new URL('file-picker.css', distDir), css);
  await writeFileEnsuringDir(new URL('file-picker.min.css', distDir), minifyCss(css));

  const banner = `Built from ./asset on ${new Date().toISOString()}\n`;
  await writeFileEnsuringDir(new URL('BUILD_INFO.txt', distDir), banner);

  process.stdout.write(`dist/ generated successfully.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
