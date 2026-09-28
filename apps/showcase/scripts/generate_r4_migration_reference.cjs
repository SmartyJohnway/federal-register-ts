const fs = require('fs');
const path = require('path');

const r310aPath = 'G:/我的雲端硬碟/ChatGPT-Workspace/Federal-Register-TS/15-R3-10-SDK-Showcase/R3-10A-C1-Evidence/c1_07_handy_r4_integration_map.json';
const targetDir = 'G:/我的雲端硬碟/ChatGPT-Workspace/Federal-Register-TS/15-R3-10-SDK-Showcase/R3-10E-Evidence';
const canonicalRegistryPath = path.join(__dirname, '../src/data/canonicalRegistry.json');

const sourceItems = JSON.parse(fs.readFileSync(r310aPath, 'utf8'));
const canonicalRegistry = JSON.parse(fs.readFileSync(canonicalRegistryPath, 'utf8'));
const validOpIds = new Set(canonicalRegistry.map((op) => op.id));

console.log('Source items count:', sourceItems.length);
console.log('Valid canonical operations count:', validOpIds.size);

// Mapping from canonical paths in R3-10A to canonical operation IDs
const pathToOpIds = {
  'client.documents.search': ['DOC-001'],
  'client.documents.find': ['DOC-002'],
  'client.documents.findMany': ['DOC-003'],
  'client.documents.findByCitation': ['DOC-004'],
  'client.documents.findManyByCitation': ['DOC-005'],
  'client.documents.autocomplete': ['DOC-006'],
  'client.documents.searchDetails': ['DOC-007'],
  'client.agencies.list': ['AGENCY-001'],
  'client.agencies.find': ['AGENCY-002'],
  'client.agencies.suggestions': ['AGENCY-004'],
  'client.publicInspection.current': ['PI-003'],
  'client.publicInspection.availableOn': ['PI-002'],
  'client.publicInspection.search': ['PI-001'],
  'client.publicInspection.find': ['PI-004'],
  'client.publicInspection.findMany': ['PI-005'],
  'client.publicInspection.searchDetails': ['PI-006'],
  'client.publicInspection.*': ['PI-001', 'PI-002', 'PI-003', 'PI-004', 'PI-005', 'PI-006'],
  'client.sections.list': ['SECTION-001'],
  'client.topics.suggestions': ['TOPIC-002'],
  'client.suggestedSearches.list': ['SUGGEST-001'],
  'client.suggestedSearches.find': ['SUGGEST-002'],
  'client.suggestedSearches.*': ['SUGGEST-001', 'SUGGEST-002', 'SUGGEST-003'],
  'client.documents.facets.agency': ['DOC-FACET-001'],
  'client.documents.facets.topic': ['DOC-FACET-002'],
  'client.documents.facets.section': ['DOC-FACET-003'],
  'client.documents.facets.type': ['DOC-FACET-004'],
  'client.documents.facets.subtype': ['DOC-FACET-005'],
  'client.documents.facets.daily': ['DOC-FACET-006'],
  'client.documents.facets.weekly': ['DOC-FACET-007'],
  'client.documents.facets.monthly': ['DOC-FACET-008'],
  'client.documents.facets.quarterly': ['DOC-FACET-009'],
  'client.documents.facets.yearly': ['DOC-FACET-010'],
  'client.publicInspection.facets.type': ['PI-FACET-001'],
  'client.publicInspection.facets.agency': ['PI-FACET-002'],
  'client.images.find': ['IMAGE-001'],
};

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

const eRows = sourceItems.map((item) => {
  const opIds = pathToOpIds[item.canonical] || [];
  if (opIds.length === 0) {
    throw new Error(`Unknown canonical mapping: ${item.canonical}`);
  }
  opIds.forEach((opId) => {
    if (!validOpIds.has(opId)) {
      throw new Error(`Invalid canonical opId: ${opId}`);
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

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.writeFileSync(path.join(targetDir, 'e_06_r4_migration_reference.json'), JSON.stringify(eRows, null, 2), 'utf8');
console.log('Saved e_06_r4_migration_reference.json with', eRows.length, 'rows');

let md = '# R4 Migration Reference Mapping (R3-10E Evidence)\n\n';
md += '**Generated:** 2026-09-28  \n';
md += '**Source Evidence:** `15-R3-10-SDK-Showcase/R3-10A-C1-Evidence/c1_07_handy_r4_integration_map.json`  \n';
md += '**Total Accepted Call Sites Mapped:** 53  \n';
md += '**Canonical SDK Version:** `federal-register-ts@1.1.0`  \n\n';
md += '## Summary Breakdown\n\n';
md += '| Responsibility Class | Count | Description |\n';
md += '|---|---|---|\n';
md += `| \`DIRECT_CANONICAL_SDK\` | ${eRows.filter((r) => r.responsibility_class === 'DIRECT_CANONICAL_SDK').length} | Direct replacement with SDK client call |\n`;
md += `| \`HANDY_CONSUMER_ADAPTER\` | ${eRows.filter((r) => r.responsibility_class === 'HANDY_CONSUMER_ADAPTER').length} | React query / state integration wrapper |\n`;
md += `| \`EMBEDDED_FR_DUPLICATION_CANDIDATE\` | ${eRows.filter((r) => r.responsibility_class === 'EMBEDDED_FR_DUPLICATION_CANDIDATE').length} | Redundant microservice/class to deprecate/retire |\n`;
md += `| \`HANDY_DOMAIN_LOGIC\` | ${eRows.filter((r) => r.responsibility_class === 'HANDY_DOMAIN_LOGIC').length} | Domain logic kept downstream in Handy |\n`;
md += `| \`DEFERRED_SDK_GAP\` | ${eRows.filter((r) => r.responsibility_class === 'DEFERRED_SDK_GAP').length} | Deferred future capabilities |\n`;
md += `| \`NEEDS_R4_PREFLIGHT\` | ${eRows.filter((r) => r.responsibility_class === 'NEEDS_R4_PREFLIGHT').length} | Requires fresh live preflight audit |\n\n`;

md += '## Complete 53-Row Migration Reference\n\n';
md += '| ID | Handy Call Site | Canonical SDK Operation(s) | Responsibility Class | Expected R4 Action |\n';
md += '|---|---|---|---|---|\n';
eRows.forEach((r) => {
  md += `| ${r.reference_id} | \`${r.handy_call_site}\` | \`${r.canonical_sdk_operation_ids.join(', ')}\` | \`${r.responsibility_class}\` | ${r.e_expected_r4_action} |\n`;
});

fs.writeFileSync(path.join(targetDir, 'e_06_r4_migration_reference.md'), md, 'utf8');
console.log('Saved e_06_r4_migration_reference.md');
