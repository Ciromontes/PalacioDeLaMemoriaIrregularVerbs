import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const projectRoot = path.resolve(process.cwd());

const DEFAULT_SOURCE = path.join(projectRoot, 'img');
const DEFAULT_DEST = path.join(projectRoot, 'public', 'img');

const VALID_EXTENSIONS = new Set([
  '.webp',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.avif',
  '.mp4',
  '.webm',
]);

function parseArgs(argv) {
  const args = {
    source: DEFAULT_SOURCE,
    dest: DEFAULT_DEST,
    dryRun: false,
    verbose: false,
    only: null,
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--verbose') args.verbose = true;
    else if (a === '--source') args.source = path.resolve(projectRoot, argv[++i] ?? '');
    else if (a === '--dest') args.dest = path.resolve(projectRoot, argv[++i] ?? '');
    else if (a === '--only') args.only = (argv[++i] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    else throw new Error(`Unknown arg: ${a}`);
  }

  return args;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function* walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

async function sha256File(filePath) {
  const data = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

function shouldInclude(filePath, onlyFolders, sourceRoot) {
  const ext = path.extname(filePath).toLowerCase();
  if (!VALID_EXTENSIONS.has(ext)) return false;
  if (!onlyFolders || onlyFolders.length === 0) return true;

  // onlyFolders refers to top-level folders under img/, e.g. ABC, AAA
  const rel = path.relative(sourceRoot, filePath);
  const top = rel.split(path.sep)[0];
  return onlyFolders.some((f) => f.toUpperCase() === top.toUpperCase());
}

async function main() {
  const args = parseArgs(process.argv);

  if (!(await exists(args.source))) {
    throw new Error(`Source folder not found: ${args.source}`);
  }

  await fs.mkdir(args.dest, { recursive: true });

  let scanned = 0;
  let copied = 0;
  let skippedSame = 0;
  const copiedDetails = [];

  for await (const srcFile of walkFiles(args.source)) {
    if (!shouldInclude(srcFile, args.only, args.source)) continue;

    scanned++;

    const relFromSource = path.relative(args.source, srcFile);
    const destFile = path.join(args.dest, relFromSource);
    const destDir = path.dirname(destFile);

    await fs.mkdir(destDir, { recursive: true });

    const destExists = await exists(destFile);

    let srcHash;
    let destHash;

    if (destExists) {
      // Hash both to avoid unnecessary copies
      [srcHash, destHash] = await Promise.all([sha256File(srcFile), sha256File(destFile)]);
      if (srcHash === destHash) {
        skippedSame++;
        if (args.verbose) {
          console.log(`SKIP (same)  ${relFromSource}`);
        }
        continue;
      }
    } else {
      srcHash = await sha256File(srcFile);
    }

    if (!args.dryRun) {
      await fs.copyFile(srcFile, destFile);
    }

    // Re-hash destination to guarantee correctness
    const finalDestHash = args.dryRun ? '(dry-run)' : await sha256File(destFile);

    copied++;
    copiedDetails.push({ rel: relFromSource, srcHash, destHashBefore: destHash ?? '(missing)', destHashAfter: finalDestHash });

    const verb = destExists ? 'UPDATE' : 'ADD';
    console.log(`${verb}       ${relFromSource}`);
    if (args.verbose) {
      console.log(`  src : ${srcHash}`);
      console.log(`  dest: ${destHash ?? '(missing)'} -> ${finalDestHash}`);
    }
  }

  console.log('');
  console.log('Sync summary');
  console.log(`  source: ${path.relative(projectRoot, args.source)}`);
  console.log(`  dest  : ${path.relative(projectRoot, args.dest)}`);
  console.log(`  scanned: ${scanned}`);
  console.log(`  copied : ${copied}${args.dryRun ? ' (dry-run)' : ''}`);
  console.log(`  same   : ${skippedSame}`);

  if (copied === 0 && scanned === 0) {
    console.log('  note  : No matching files found. Check your img/ folder and extensions.');
  }
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exitCode = 1;
});
