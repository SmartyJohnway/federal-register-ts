const fs = require('fs');
const path = require('path');

/**
 * Pure transformation from accepted R3-10A Handy call sites to R3-10E migration reference rows.
 * Derives operation IDs directly from canonicalRegistry.json without maintaining a second handwritten lookup.
 */
function transformR310AToR4Map(sourceItems, canonicalRegistry) {
  const validOpIds = new Set(canonicalRegistry.map((op) => op.id));

  // Build path-to-ID lookup strictly from canonicalRegistry.json
  const pathLookup = new Map();
  canonicalRegistry.forEach((op) => {
    pathLookup.set(op.path, op.id);
  });

  function resolveCanonicalOpIds(item) {
    // Exact accessor match
    if (pathLookup.has(item.canonical)) {
      return [pathLookup.get(item.canonical)];
    }

    // Governed wildcard role-based mapping per accepted R3-10A evidence
    if (item.canonical === 'client.publicInspection.*') {
      // Accepted role: Routes current vs availableOn vs search
      return [
        pathLookup.get('client.publicInspection.search'),
        pathLookup.get('client.publicInspection.availableOn'),
        pathLookup.get('client.publicInspection.current'),
      ].filter(Boolean);
    }

    if (item.canonical === 'client.suggestedSearches.*') {
      // Accepted role: Dispatches list vs find by slug
      return [
        pathLookup.get('client.suggestedSearches.list'),
        pathLookup.get('client.suggestedSearches.find'),
      ].filter(Boolean);
    }

    throw new Error(`Unmapped canonical accessor in item ${item.id}: ${item.canonical}`);
  }

  function determineResponsibility(item) {
    if (item.handyPath.startsWith('netlify/functions/fr-ts-microservices/')) {
      return 'EMBEDDED_FR_DUPLICATION_CANDIDATE';
    }
    if (item.handyPath.startsWith('src/apps/')) {
      return 'HANDY_CONSUMER_ADAPTER';
    }
    if (item.handyPath.startsWith('netlify/functions/')) {
      return 'EMBEDDED_FR_DUPLICATION_CANDIDATE';
    }
    if (item.handyPath.startsWith('src/lib/frTsApi2.ts')) {
      return 'DIRECT_CANONICAL_SDK';
    }
    return 'NEEDS_R4_PREFLIGHT';
  }

  return sourceItems.map((item) => {
    const opIds = resolveCanonicalOpIds(item);
    if (!opIds || opIds.length === 0) {
      throw new Error(`Zero operation IDs resolved for item ${item.id}`);
    }

    // Verify all operation IDs exist in canonical 54 registry
    opIds.forEach((opId) => {
      if (!validOpIds.has(opId)) {
        throw new Error(`Invalid canonical opId ${opId} for item ${item.id}`);
      }
    });

    const respClass = determineResponsibility(item);

    return {
      reference_id: item.id,
      r3_10a_source_evidence: `c1_07_handy_r4_integration_map.json:id_${item.id}`,
      handy_call_site: item.handyPath,
      handy_current_role_as_recorded: `${item.symbol} via ${item.wrapper} (${item.appLogic})`,
      canonical_sdk_operation_ids: opIds,
      responsibility_class: respClass,
      adapter_or_domain_note: item.appLogic,
      semantic_risk: 'Low: Standardized request/response mapping to official Federal Register API.',
      e_expected_r4_action: `${item.retirement}; ${item.r4Obligation}`,
      requires_fresh_r4_preflight: true,
      status: 'READY_FOR_R4_PREFLIGHT',
    };
  });
}

function generateMarkdown(eRows) {
  const counts = {
    DIRECT_CANONICAL_SDK: eRows.filter((r) => r.responsibility_class === 'DIRECT_CANONICAL_SDK').length,
    HANDY_CONSUMER_ADAPTER: eRows.filter((r) => r.responsibility_class === 'HANDY_CONSUMER_ADAPTER').length,
    EMBEDDED_FR_DUPLICATION_CANDIDATE: eRows.filter((r) => r.responsibility_class === 'EMBEDDED_FR_DUPLICATION_CANDIDATE').length,
    HANDY_DOMAIN_LOGIC: eRows.filter((r) => r.responsibility_class === 'HANDY_DOMAIN_LOGIC').length,
    DEFERRED_SDK_GAP: eRows.filter((r) => r.responsibility_class === 'DEFERRED_SDK_GAP').length,
    NEEDS_R4_PREFLIGHT: eRows.filter((r) => r.responsibility_class === 'NEEDS_R4_PREFLIGHT').length,
  };

  let md = '# R4 Migration Reference Mapping (R3-10E-C1 Corrected Evidence)\n\n';
  md += '**Generated:** 2026-09-28  \n';
  md += '**Source Evidence:** `15-R3-10-SDK-Showcase/R3-10A-C1-Evidence/c1_07_handy_r4_integration_map.json`  \n';
  md += '**Total Accepted Call Sites Mapped:** 53  \n';
  md += '**Canonical SDK Version:** `federal-register-ts@1.1.0`  \n\n';
  md += '## Summary Breakdown\n\n';
  md += '| Responsibility Class | Count | Description |\n';
  md += '|---|---|---|\n';
  md += `| \`DIRECT_CANONICAL_SDK\` | ${counts.DIRECT_CANONICAL_SDK} | Direct replacement with SDK client call |\n`;
  md += `| \`HANDY_CONSUMER_ADAPTER\` | ${counts.HANDY_CONSUMER_ADAPTER} | React query / state integration wrapper |\n`;
  md += `| \`EMBEDDED_FR_DUPLICATION_CANDIDATE\` | ${counts.EMBEDDED_FR_DUPLICATION_CANDIDATE} | Redundant microservice/class to deprecate/retire |\n`;
  md += `| \`HANDY_DOMAIN_LOGIC\` | ${counts.HANDY_DOMAIN_LOGIC} | Domain logic kept downstream in Handy |\n`;
  md += `| \`DEFERRED_SDK_GAP\` | ${counts.DEFERRED_SDK_GAP} | Deferred future capabilities |\n`;
  md += `| \`NEEDS_R4_PREFLIGHT\` | ${counts.NEEDS_R4_PREFLIGHT} | Requires fresh live preflight audit |\n\n`;

  md += '## Complete 53-Row Migration Reference\n\n';
  md += '| ID | Handy Call Site | Canonical SDK Operation(s) | Responsibility Class | Expected R4 Action |\n';
  md += '|---|---|---|---|---|\n';
  eRows.forEach((r) => {
    md += `| ${r.reference_id} | \`${r.handy_call_site}\` | \`${r.canonical_sdk_operation_ids.join(', ')}\` | \`${r.responsibility_class}\` | ${r.e_expected_r4_action} |\n`;
  });

  return { md, counts };
}

// CLI / Execution entrypoint
if (require.main === module) {
  const args = process.argv.slice(2);
  function getArg(flag, envVar) {
    const idx = args.indexOf(flag);
    if (idx !== -1 && args[idx + 1]) {
      return args[idx + 1];
    }
    return process.env[envVar] || null;
  }

  const r310aPath = getArg('--source', 'R3_10A_MAP_PATH');
  const outputJsonPath = getArg('--output-json', 'R3_10E_MAP_JSON');
  const outputMdPath = getArg('--output-md', 'R3_10E_MAP_MD');

  if (!r310aPath || !outputJsonPath || !outputMdPath) {
    console.log('Usage: node generate_r4_migration_reference.cjs --source <path> --output-json <path> --output-md <path>');
    console.log('Or provide environment variables: R3_10A_MAP_PATH, R3_10E_MAP_JSON, R3_10E_MAP_MD');
    process.exit(1);
  }

  const canonicalRegistryPath = path.join(__dirname, '../src/data/canonicalRegistry.json');
  const sourceItems = JSON.parse(fs.readFileSync(r310aPath, 'utf8'));
  const canonicalRegistry = JSON.parse(fs.readFileSync(canonicalRegistryPath, 'utf8'));

  const eRows = transformR310AToR4Map(sourceItems, canonicalRegistry);
  const { md, counts } = generateMarkdown(eRows);

  const jsonDir = path.dirname(outputJsonPath);
  if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir, { recursive: true });
  fs.writeFileSync(outputJsonPath, JSON.stringify(eRows, null, 2), 'utf8');

  const mdDir = path.dirname(outputMdPath);
  if (!fs.existsSync(mdDir)) fs.mkdirSync(mdDir, { recursive: true });
  fs.writeFileSync(outputMdPath, md, 'utf8');

  console.log(`Saved ${eRows.length} migration reference rows to: ${outputJsonPath}`);
  console.log(`Saved migration reference markdown to: ${outputMdPath}`);
  console.log('Responsibility Counts:', JSON.stringify(counts));
}

module.exports = {
  transformR310AToR4Map,
  generateMarkdown,
};
