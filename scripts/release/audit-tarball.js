#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

function findTarball(dir) {
  const files = fs.readdirSync(dir);
  const tarballs = files.filter(f => f.startsWith('federal-register-ts-') && f.endsWith('.tgz'));
  if (tarballs.length === 0) {
    throw new Error(`No federal-register-ts-*.tgz tarball found in ${dir}`);
  }
  return path.join(dir, tarballs[0]);
}

function main() {
  const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  let tarballPath;

  if (fs.existsSync(targetDir) && fs.statSync(targetDir).isFile() && targetDir.endsWith('.tgz')) {
    tarballPath = targetDir;
  } else {
    tarballPath = findTarball(targetDir);
  }

  console.log('=== Release Tarball Security & Composition Audit ===');
  console.log(`Tarball Path: ${tarballPath}`);

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

  console.log('\nTarball Path Leakage Audit: PASS (0 forbidden entries)');
  console.log('Tarball Composition Audit: PASS');
}

main();
