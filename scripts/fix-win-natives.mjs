import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const packages = [
  { name: '@esbuild/win32-x64', version: require('../node_modules/esbuild/package.json').version },
  { name: '@rollup/rollup-win32-x64-msvc', version: null },
  {
    name: 'lightningcss-win32-x64-msvc',
    version: require('../node_modules/lightningcss/package.json').version,
  },
  {
    name: '@tailwindcss/oxide-win32-x64-msvc',
    version: require('../node_modules/@tailwindcss/oxide/package.json').version,
  },
];

async function installPkg({ name, version }) {
  const url = 'https://registry.npmjs.org/' + name.replace('/', '%2f');
  const meta = await (await fetch(url)).json();
  if (meta.error) {
    console.warn('Skip', name, meta.error);
    return;
  }
  const ver = version || meta['dist-tags'].latest;
  const info = meta.versions[ver];
  if (!info) {
    console.warn('No version', name, ver, 'falling back to latest');
  }
  const resolved = info || meta.versions[meta['dist-tags'].latest];
  const tarball = resolved.dist.tarball;
  console.log('Installing', name, resolved.version);

  const tgz = path.join(os.tmpdir(), name.replace(/[\/@]/g, '_') + '.tgz');
  const buf = Buffer.from(await (await fetch(tarball)).arrayBuffer());
  fs.writeFileSync(tgz, buf);

  const scoped = name.startsWith('@');
  const dest = scoped
    ? path.join('node_modules', ...name.split('/'))
    : path.join('node_modules', name);

  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });

  const extractDir = path.join(os.tmpdir(), 'pkg-extract-' + name.replace(/[\/@]/g, '_'));
  fs.rmSync(extractDir, { recursive: true, force: true });
  fs.mkdirSync(extractDir, { recursive: true });
  execSync(`tar -xf "${tgz}" -C "${extractDir}"`, { stdio: 'inherit' });

  const pkg = path.join(extractDir, 'package');
  for (const f of fs.readdirSync(pkg)) {
    fs.cpSync(path.join(pkg, f), path.join(dest, f), { recursive: true });
  }
  console.log('OK', dest);
}

for (const pkg of packages) {
  await installPkg(pkg);
}
