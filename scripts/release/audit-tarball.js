#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

function main() {
  // Require explicit tarball path — no directory-scan fallback
  const tarballArg = process.argv[2];

  if (!tarballArg) {
    console.error('Usage: node audit-tarball.js <exact-tarball-path>');
    console.error('Error: Explicit tarball path is required. Directory discovery is not supported.');
    process.exit(1);
  }

  const tarballPath = path.resolve(tarballArg);

  if (!fs.existsSync(tarballPath)) {
    console.error(`Error: Tarball not found at path: ${tarballPath}`);
    process.exit(1);
  }

  if (!tarballPath.endsWith('.tgz')) {
    console.error(`Error: Path does not point to a .tgz file: ${tarballPath}`);
    process.exit(1);
  }

  if (!fs.statSync(tarballPath).isFile()) {
    console.error(`Error: Path is not a regular file: ${tarballPath}`);
    process.exit(1);
  }

  console.log('=== Release Tarball Security & Composition Audit ===');
  console.log(`Tarball Path: ${tarballPath}`);

  // Compute exact hashes
  const tarballBytes = fs.readFileSync(tarballPath);
  const sha256 = crypto.createHash('sha256').update(tarballBytes).digest('hex');
  const sha512 = crypto.createHash('sha512').update(tarballBytes).digest('hex');

  console.log(`Size:         ${tarballBytes.length} bytes`);
  console.log(`SHA-256:      ${sha256}`);
  console.log(`SHA-512:      ${sha512}`);

  // List tarball entries using tar command
  const listOutput = execSync(`tar -tf "${tarballPath}"`, { encoding: 'utf8' });
  const rawEntries = listOutput.split(/\r?\n/).filter(line => line.trim().length > 0);

  // Normalize entries: strip leading 'package/'
  const entries = rawEntries.map(e => e.replace(/^package\//, ''));
  console.log(`Total Entries: ${entries.length}`);

  // Forbidden prefixes — detect source/config leakage into publication surface
  const forbiddenPrefixes = [
    'src/',
    'tests/',
    '.github/',
    'examples/',
    'docs/',
    '.git',
    'tsconfig',
    'jest.config',
    '.eslintrc',
    '.prettierrc'
  ];

  const leaks = [];
  let distCount = 0;
  let rootFiles = [];

  for (const entry of entries) {
    for (const forbidden of forbiddenPrefixes) {
      if (entry.startsWith(forbidden) || entry === forbidden) {
        leaks.push(entry);
      }
    }

    if (entry.startsWith('dist/')) {
      distCount++;
    } else if (!entry.includes('/')) {
      rootFiles.push(entry);
    }
  }

  console.log(`Distribution Files (dist/**): ${distCount}`);
  console.log(`Root Package Files:           ${rootFiles.join(', ')}`);

  // Verify allowed publication surface — no forbidden entries
  if (leaks.length > 0) {
    console.error('\nCRITICAL SECURITY LEAKAGE DETECTED:');
    for (const leak of leaks) {
      console.error(`- Forbidden entry in tarball: ${leak}`);
    }
    process.exit(1);
  }

  // Ensure mandatory root files
  const mandatoryFiles = ['package.json', 'README.md', 'LICENSE'];
  const missingFiles = mandatoryFiles.filter(f => !entries.includes(f));

  if (missingFiles.length > 0) {
    console.error('\nCRITICAL: Missing mandatory package files:');
    for (const mf of missingFiles) {
      console.error(`- Missing: ${mf}`);
    }
    process.exit(1);
  }

  console.log('\n=== Audit Summary ===');
  console.log('Publication Surface Leakage Check: PASS (0 forbidden entries)');
  console.log('Mandatory Root Files Check:        PASS');
  console.log('Exact Hash Computation:            RECORDED');
  console.log('Entry Count:                       RECORDED');
  console.log('Tarball Composition Audit:         PASS');
}

main();
