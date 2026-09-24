import { Layers, CheckCircle2, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import {
  TOTAL_OPERATIONS_COUNT,
  ROOT_NAMESPACES,
  TIER_COUNTS,
  getNamespaceMetadata,
} from '../data/registry';

export function CapabilitiesView() {
  const namespaces = getNamespaceMetadata();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Canonical SDK Capability Matrix</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="tierA">Tier A: {TIER_COUNTS['Tier A']}</Badge>
            <Badge variant="tierB">Tier B: {TIER_COUNTS['Tier B']}</Badge>
            <Badge variant="tierC">Tier C: {TIER_COUNTS['Tier C']}</Badge>
            <Badge variant="default">Total: {TOTAL_OPERATIONS_COUNT}</Badge>
          </div>
        </CardHeader>
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          The Showcase carries the audited canonical metadata across {ROOT_NAMESPACES.length} SDK root namespaces,
          categorized by operational frequency, projection flexibility, and accessibility tiers (with open v1.2.0 items deferred).
        </p>

        {/* Tier Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-400 text-sm">Tier A — Primary Core</span>
              <Badge variant="tierA">9 Operations</Badge>
            </div>
            <p className="text-xs text-slate-300">
              High-frequency interactive endpoints including full-text document search, single document lookup, agency directory, and live Public Inspection feeds.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-cyan-400 text-sm">Tier B — Secondary &amp; Facets</span>
              <Badge variant="tierB">33 Operations</Badge>
            </div>
            <p className="text-xs text-slate-300">
              Specialized search dimensions, multi-entity batch lookups, facet aggregations, topic catalogs, and holiday calendars.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-400 text-sm">Tier C — Companion &amp; Specialized</span>
              <Badge variant="tierC">12 Operations</Badge>
            </div>
            <p className="text-xs text-slate-300">
              Specialized sub-entity lookups, raw format streams (CSV), citation-specific indices, OpenAPI document retrieval, and companion utilities.
            </p>
          </div>
        </div>

        {/* Namespace Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Namespace</th>
                <th className="py-3 px-4">Total Ops</th>
                <th className="py-3 px-4">Tier A</th>
                <th className="py-3 px-4">Tier B</th>
                <th className="py-3 px-4">Tier C</th>
                <th className="py-3 px-4">Trade Relevant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {namespaces.map((ns) => (
                <tr key={ns.namespace} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-cyan-400 flex items-center gap-1.5">
                    <span>client.{ns.namespace}</span>
                  </td>
                  <td className="py-3 px-4">{ns.totalOperations}</td>
                  <td className="py-3 px-4 text-emerald-400">{ns.tierA}</td>
                  <td className="py-3 px-4 text-cyan-400">{ns.tierB}</td>
                  <td className="py-3 px-4 text-amber-400">{ns.tierC}</td>
                  <td className="py-3 px-4 text-purple-400">{ns.tradeRelevantCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Hardening Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Query Serialization &amp; Hardening</span>
            </CardTitle>
          </CardHeader>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Strict separation between full-text query string (<code className="text-cyan-300 font-mono">conditions[term]</code>) and structured filters.</li>
            <li>Array parameter serialization semantics: Disjunction (OR) within fields.</li>
            <li>Zero undefined/null query leakages.</li>
            <li>Hardened JSONP companion isolation.</li>
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Shield className="w-5 h-5 text-indigo-400" />
              <span>Runtime &amp; Ecosystem Compliance</span>
            </CardTitle>
          </CardHeader>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Node.js 22 and 24 verified SDK lanes.</li>
            <li>Showcase production runtime target: Node.js 24.</li>
            <li>TypeScript 7.0.2 strict compilation baseline.</li>
            <li>Strict Zero-External-Dependency core SDK footprint.</li>
            <li>Independent npm package resolution in Showcase (<code className="text-emerald-300 font-mono">federal-register-ts@1.1.0</code>).</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
