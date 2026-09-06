import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

const name = '@rollup/rollup-win32-x64-msvc';
const url = 'https://registry.npmjs.org/@rollup%2frollup-win32-x64-msvc';

const meta = await (await fetch(url)).json();
const version = meta['dist-tags'].latest;
const tarball = meta.versions[version].dist.tarball;
console.log('Installing', name, version);

const tgz = path.join(os.tmpdir(), 'rollup-win.tgz');
const buf = Buffer.from(await (await fetch(tarball)).arrayBuffer());
fs.writeFileSync(tgz, buf);

const dest = path.join('node_modules', '@rollup', 'rollup-win32-x64-msvc');
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

const extractDir = path.join(os.tmpdir(), 'rollup-win-extract');
fs.rmSync(extractDir, { recursive: true, force: true });
fs.mkdirSync(extractDir, { recursive: true });
execSync(`tar -xf "${tgz}" -C "${extractDir}"`, { stdio: 'inherit' });

const pkg = path.join(extractDir, 'package');
for (const f of fs.readdirSync(pkg)) {
  fs.cpSync(path.join(pkg, f), path.join(dest, f), { recursive: true });
}

console.log('Installed to', dest);
console.log(fs.readdirSync(dest));
