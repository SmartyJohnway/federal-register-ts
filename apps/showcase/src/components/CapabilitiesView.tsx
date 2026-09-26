import { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  CheckCircle2,
  Shield,
  PlayCircle,
  FileCode,
  Filter,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import {
  CANONICAL_OPERATIONS,
  TOTAL_OPERATIONS_COUNT,
  ROOT_NAMESPACES,
  TIER_COUNTS,
  getNamespaceMetadata,
} from '../data/registry';
import { getPresentationOverlay } from '../data/presentationOverlay';
import { isRunnable } from '../lib/executor';
import type { CanonicalOperation, OperationTier } from '../types/registry';

interface CapabilitiesViewProps {
  onOpenInWorkbench?: (operationId: string) => void;
}

export function CapabilitiesView({ onOpenInWorkbench }: CapabilitiesViewProps) {
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedRunStatus, setSelectedRunStatus] = useState<string>('all'); // 'all' | 'runnable' | 'documented'
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDetailOp, setActiveDetailOp] = useState<CanonicalOperation | null>(null);

  const namespacesMeta = useMemo(() => getNamespaceMetadata(), []);

  const filteredOperations = useMemo(() => {
    return CANONICAL_OPERATIONS.filter((op) => {
      // Namespace filter
      const opNs = op.path.split('.')[1];
      if (selectedNamespace !== 'all' && opNs !== selectedNamespace) {
        return false;
      }

      // Tier filter
      if (selectedTier !== 'all' && op.tier !== selectedTier) {
        return false;
      }

      // Runnable / Documented filter
      const runnable = isRunnable(op.id);
      if (selectedRunStatus === 'runnable' && !runnable) return false;
      if (selectedRunStatus === 'documented' && runnable) return false;

      // Text search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = op.id.toLowerCase().includes(query);
        const matchesPath = op.path.toLowerCase().includes(query);
        const matchesDesc = op.desc.toLowerCase().includes(query);
        const matchesMethod = op.method.toLowerCase().includes(query);
        if (!matchesId && !matchesPath && !matchesDesc && !matchesMethod) {
          return false;
        }
      }

      return true;
    });
  }, [selectedNamespace, selectedTier, selectedRunStatus, searchQuery]);

  const getTierBadgeVariant = (tier: OperationTier) => {
    switch (tier) {
      case 'Tier A':
        return 'tierA';
      case 'Tier B':
        return 'tierB';
      case 'Tier C':
        return 'tierC';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Canonical SDK Capability Matrix</span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
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
              Specialized sub-entity lookups, raw format streams (CSV/RSS), OpenAPI document retrieval, and companion utilities (Documented Only).
            </p>
          </div>
        </div>

        {/* Namespace Summary Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800 mb-6">
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
              {namespacesMeta.map((ns) => (
                <tr
                  key={ns.namespace}
                  onClick={() => setSelectedNamespace(selectedNamespace === ns.namespace ? 'all' : ns.namespace)}
                  className={`cursor-pointer transition-colors ${
                    selectedNamespace === ns.namespace ? 'bg-slate-800/60' : 'hover:bg-slate-900/40'
                  }`}
                >
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

      {/* Interactive 54-Operation Capability Catalog */}
      <Card>
        <CardHeader>
          <CardTitle>
            <FileCode className="w-5 h-5 text-cyan-400" />
            <span>Interactive Capability Catalog ({filteredOperations.length} of {TOTAL_OPERATIONS_COUNT} Operations)</span>
          </CardTitle>
        </CardHeader>

        {/* Filter Controls */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search operations by ID, path, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Namespace Selector */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              <select
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="all">All Namespaces (14)</option>
                {ROOT_NAMESPACES.map((ns) => (
                  <option key={ns} value={ns}>
                    client.{ns}
                  </option>
                ))}
              </select>
            </div>

            {/* Tier & Runnable Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-1/2 bg-slate-950 border border-slate-800 rounded-md py-2 px-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="all">All Tiers</option>
                <option value="Tier A">Tier A (9)</option>
                <option value="Tier B">Tier B (33)</option>
                <option value="Tier C">Tier C (12)</option>
              </select>

              <select
                value={selectedRunStatus}
                onChange={(e) => setSelectedRunStatus(e.target.value)}
                className="w-1/2 bg-slate-950 border border-slate-800 rounded-md py-2 px-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="all">All Status</option>
                <option value="runnable">Runnable (42)</option>
                <option value="documented">Documented (12)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Operation Cards List */}
        <div className="space-y-3">
          {filteredOperations.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No canonical operations match the current filter criteria.
            </div>
          ) : (
            filteredOperations.map((op) => {
              const runnable = isRunnable(op.id);
              const overlay = getPresentationOverlay(op.id);
              return (
                <div
                  key={op.id}
                  className="p-4 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        #{op.ordinal} {op.id}
                      </span>
                      <span className="font-mono text-sm font-semibold text-cyan-400">
                        {op.path}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={getTierBadgeVariant(op.tier)}>{op.tier}</Badge>
                      {runnable ? (
                        <Badge variant="outline" className="text-emerald-400 border-emerald-900/60 bg-emerald-950/20">
                          Runnable
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-400 border-amber-900/60 bg-amber-950/20">
                          Documented Only
                        </Badge>
                      )}
                      {op.trade && <Badge variant="trade">Trade</Badge>}
                      <Badge variant={op.paramReq === 'Required' ? 'default' : 'outline'}>
                        {op.paramReq}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">
                    <span className="font-semibold text-slate-200">{overlay.title}: </span>
                    {op.desc}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-slate-900/70 p-2 rounded border border-slate-800/60 overflow-x-auto">
                      <span className="text-slate-500">params: </span>
                      <span className="text-slate-300">{op.params}</span>
                    </div>
                    <div className="bg-slate-900/70 p-2 rounded border border-slate-800/60 overflow-x-auto">
                      <span className="text-slate-500">returns: </span>
                      <span className="text-indigo-300">{op.returns}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => setActiveDetailOp(activeDetailOp?.id === op.id ? null : op)}
                      className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>{activeDetailOp?.id === op.id ? 'Hide Details' : 'View Full Details'}</span>
                    </button>

                    {runnable && onOpenInWorkbench && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onOpenInWorkbench(op.id)}
                        className="flex items-center gap-1 text-xs py-1"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Open in Workbench</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </Button>
                    )}
                  </div>

                  {/* Expanded Detail Panel */}
                  {activeDetailOp?.id === op.id && (
                    <div className="mt-3 p-3 rounded bg-slate-900/90 border border-slate-700/60 space-y-2 text-xs font-mono animate-fadeIn">
                      <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        Canonical Signature &amp; Overlay Metadata
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                        <div><span className="text-slate-500">Ordinal:</span> {op.ordinal}</div>
                        <div><span className="text-slate-500">Namespace Owner:</span> client.{op.path.split('.')[1]}</div>
                        <div><span className="text-slate-500">Method Name:</span> {op.method}</div>
                        <div><span className="text-slate-500">Parameter Requirement:</span> {op.paramReq}</div>
                        <div><span className="text-slate-500">Execution Status:</span> {runnable ? 'Runnable (42 Allowlist)' : 'Tier C (Documented Only)'}</div>
                        <div><span className="text-slate-500">Trade Domain:</span> {op.trade ? 'Yes' : 'No'}</div>
                      </div>
                      <div className="text-slate-400 pt-1">
                        <span className="text-slate-500">Hint:</span> {overlay.hint}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
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
