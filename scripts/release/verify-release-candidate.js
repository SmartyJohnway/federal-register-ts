#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function parseArgs(args) {
  const options = {
    targetVersion: null,
    distTag: null,
    allowDirty: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--target-version' && i + 1 < args.length) {
      options.targetVersion = args[++i];
    } else if (arg === '--dist-tag' && i + 1 < args.length) {
      options.distTag = args[++i];
    } else if (arg === '--allow-dirty') {
      options.allowDirty = true;
    }
  }

  return options;
}

function validateSemVer(version) {
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(version);
}

function main() {
  const rootDir = path.resolve(__dirname, '..', '..');
  const pkgPath = path.join(rootDir, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    console.error('Error: package.json not found at ' + pkgPath);
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const options = parseArgs(process.argv.slice(2));

  console.log('=== Release Candidate Verification ===');
  console.log(`Package Name:    ${pkg.name}`);
  console.log(`Package Version: ${pkg.version}`);

  const errors = [];

  // 1. Mandatory metadata fields
  if (pkg.name !== 'federal-register-ts') {
    errors.push(`Invalid package name: expected "federal-register-ts", found "${pkg.name}"`);
  }

  if (!validateSemVer(pkg.version)) {
    errors.push(`Invalid SemVer in package.json: "${pkg.version}"`);
  }

  if (pkg.license !== 'MIT') {
    errors.push(`Invalid license: expected "MIT", found "${pkg.license}"`);
  }

  if (pkg.main !== 'dist/index.js') {
    errors.push(`Invalid main entry point: expected "dist/index.js", found "${pkg.main}"`);
  }

  if (pkg.types !== 'dist/index.d.ts') {
    errors.push(`Invalid types entry point: expected "dist/index.d.ts", found "${pkg.types}"`);
  }

  if (!pkg.repository || !pkg.repository.url || !pkg.repository.url.includes('SmartyJohnway/federal-register-ts')) {
    errors.push('Repository URL missing or does not match canonical SmartyJohnway/federal-register-ts');
  }

  if (pkg.private === true) {
    errors.push('Package is marked as private: true. Cannot publish public release.');
  }

  // 2. Target version matching if provided
  if (options.targetVersion) {
    console.log(`Target Version:  ${options.targetVersion}`);
    if (pkg.version !== options.targetVersion) {
      errors.push(`Version mismatch: package.json version "${pkg.version}" does not match target "${options.targetVersion}"`);
    }
  }

  // 3. Dist-tag policy validation
  if (options.distTag) {
    console.log(`Dist-tag:        ${options.distTag}`);
    const validTags = ['latest', 'rc', 'next', 'beta', 'alpha'];
    if (!validTags.includes(options.distTag)) {
      errors.push(`Invalid dist-tag "${options.distTag}". Must be one of: ${validTags.join(', ')}`);
    }

    const isPrerelease = pkg.version.includes('-');
    if (isPrerelease && options.distTag === 'latest') {
      errors.push(`Safety violation: Pre-release version "${pkg.version}" must not be published to "latest" dist-tag.`);
    }

    if (!isPrerelease && (options.distTag === 'rc' || options.distTag === 'next')) {
      console.warn(`[WARNING] Stable version "${pkg.version}" is being mapped to non-latest dist-tag "${options.distTag}".`);
    }
  }

  if (errors.length > 0) {
    console.error('\nRelease Candidate Verification FAILED with errors:');
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  console.log('\nRelease Candidate Verification: PASS');
}

main();
