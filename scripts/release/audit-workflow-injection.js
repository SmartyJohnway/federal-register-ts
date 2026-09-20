#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function auditWorkflow(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  
  let inRunBlock = false;
  let runIndent = 0;
  const injectionFindings = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Check for run block start
    const runMatch = line.match(/^(\s*)run:\s*(\|.*|>.*)?$/);
    if (runMatch) {
      inRunBlock = true;
      runIndent = runMatch[1].length;
      continue;
    }
    
    // If in run block, check indentation
    if (inRunBlock) {
      const currentIndent = line.match(/^(\s*)/)[1].length;
      // If line is not empty and has less or equal indent than 'run:', we exited the run block
      if (line.trim().length > 0 && currentIndent <= runIndent && !line.startsWith(' '.repeat(runIndent + 1))) {
        inRunBlock = false;
      } else {
        // We are inside run block! Check for ${{ inputs.* }} interpolation
        const expressionMatch = line.match(/\$\{\{\s*inputs\.[a-zA-Z0-9_-]+\s*\}\}/g);
        if (expressionMatch) {
          injectionFindings.push({
            lineNumber: lineNum,
            lineContent: line.trim(),
            expressions: expressionMatch
          });
        }
      }
    }
  }

  // Also check for safe env bindings
  const hasEnvBindingTargetVersion = content.includes('TARGET_VERSION: ${{ inputs.target_version }}');
  const hasEnvBindingDistTag = content.includes('DIST_TAG: ${{ inputs.dist_tag }}');
  const referencesTargetVersionEnv = content.includes('"$TARGET_VERSION"');
  const referencesDistTagEnv = content.includes('"$DIST_TAG"');

  const passed = injectionFindings.length === 0 &&
                 hasEnvBindingTargetVersion &&
                 hasEnvBindingDistTag &&
                 referencesTargetVersionEnv &&
                 referencesDistTagEnv;

  const result = {
    audit_target: filePath,
    direct_expression_in_run_findings: injectionFindings,
    safe_env_bindings: {
      hasEnvBindingTargetVersion,
      hasEnvBindingDistTag,
      referencesTargetVersionEnv,
      referencesDistTagEnv
    },
    passed,
    disposition: passed ? "PASS — ZERO_SCRIPT_INJECTION_VULNERABILITY" : "FAIL — SCRIPT_INJECTION_DETECTED"
  };

  return result;
}

function main() {
  const defaultPath = path.resolve(__dirname, '..', '..', '.github', 'workflows', 'release.yml');
  const targetPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultPath;

  console.log('=== Workflow Script-Injection Static Security Audit ===');
  console.log(`Auditing: ${targetPath}`);

  if (!fs.existsSync(targetPath)) {
    console.error(`Error: File not found: ${targetPath}`);
    process.exit(1);
  }

  const result = auditWorkflow(targetPath);
  console.log(JSON.stringify(result, null, 2));

  if (!result.passed) {
    console.error('\nStatic Security Audit: FAILED');
    process.exit(1);
  }

  console.log('\nStatic Security Audit: PASS (No direct ${{ inputs.* }} inside run blocks)');
}

if (require.main === module) {
  main();
}

module.exports = { auditWorkflow };
