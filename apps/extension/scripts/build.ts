import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const watch = args.includes('--watch');
const target = args.includes('--target') ? args[args.indexOf('--target') + 1] : 'all';

async function buildExtension(browser: 'chrome' | 'firefox') {
  const outDir = `dist-${browser}`;
  const manifestSrc = `manifests/${browser}.json`;
  
  console.log(`[${browser}] Building...`);

  // Ensure dist dir exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Copy manifest
  fs.copyFileSync(manifestSrc, path.join(outDir, 'manifest.json'));

  const commonOptions: esbuild.BuildOptions = {
    bundle: true,
    minify: !watch,
    sourcemap: watch,
    format: 'iife', // Browser extensions run in isolated scope
    target: ['es2020'],
    logLevel: 'info',
  };

  try {
    // Build background script
    const bgCtx = await esbuild.context({
      ...commonOptions,
      entryPoints: ['src/background/service-worker.ts'],
      outfile: path.join(outDir, 'background.js'),
    });

    // Build content script
    const contentCtx = await esbuild.context({
      ...commonOptions,
      entryPoints: ['src/content/bridge.ts'],
      outfile: path.join(outDir, 'content.js'),
    });

    if (watch) {
      await bgCtx.watch();
      await contentCtx.watch();
      console.log(`[${browser}] Watching for changes...`);
    } else {
      await bgCtx.rebuild();
      await contentCtx.rebuild();
      await bgCtx.dispose();
      await contentCtx.dispose();
      console.log(`[${browser}] Build complete.`);
    }
  } catch (error) {
    console.error(`[${browser}] Build failed:`, error);
    process.exit(1);
  }
}

async function main() {
  if (target === 'all' || target === 'chrome') {
    await buildExtension('chrome');
  }
  if (target === 'all' || target === 'firefox') {
    await buildExtension('firefox');
  }
}

main();
