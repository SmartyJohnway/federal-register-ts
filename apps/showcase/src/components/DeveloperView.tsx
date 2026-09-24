import { useState, useMemo } from 'react';
import { Search, Copy, Check, Terminal, FileCode2, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import { EmptyState } from './FeedbackStates';
import { CANONICAL_OPERATIONS, ROOT_NAMESPACES } from '../data/registry';
import type { OperationTier } from '../types/registry';

export function DeveloperView() {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const filteredOperations = useMemo(() => {
    return CANONICAL_OPERATIONS.filter((op) => {
      const matchSearch =
        searchTerm === '' ||
        op.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.desc.toLowerCase().includes(searchTerm.toLowerCase());

      const matchNamespace = selectedNamespace === 'all' || op.ns === selectedNamespace;
      const matchTier = selectedTier === 'all' || op.tier === selectedTier;

      return matchSearch && matchNamespace && matchTier;
    });
  }, [searchTerm, selectedNamespace, selectedTier]);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('npm install federal-register-ts@1.1.0');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      {/* Quickstart Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span>Developer Quickstart &amp; Installation</span>
          </CardTitle>
          <a
            href="https://www.npmjs.com/package/federal-register-ts"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
          >
            <span>npm package</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-sm">
            <span className="text-emerald-400">npm install federal-register-ts@1.1.0</span>
            <button
              onClick={handleCopyInstall}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">SDK Usage Example</div>
            <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
{`import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

// Tier A primary document search
const results = await client.documents.search({
  conditions: { term: 'tariff rate quota' },
  perPage: 10,
});

console.log(\`Found \${results.count} documents\`);`}
            </pre>
          </div>
        </div>
      </Card>

      {/* Operation Catalog Controls */}
      <Card>
        <CardHeader>
          <CardTitle>
            <FileCode2 className="w-5 h-5 text-indigo-400" />
            <span>Canonical 54 Operations Catalog</span>
          </CardTitle>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredOperations.length} of {CANONICAL_OPERATIONS.length} operations
          </span>
        </CardHeader>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID, path, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <select
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="all">All Namespaces (14)</option>
              {ROOT_NAMESPACES.map((ns) => (
                <option key={ns} value={ns}>
                  {ns}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="all">All Tiers (A/B/C)</option>
              <option value="Tier A">Tier A (Primary 9)</option>
              <option value="Tier B">Tier B (Secondary 33)</option>
              <option value="Tier C">Tier C (Companion 12)</option>
            </select>
          </div>
        </div>

        {/* Operation List */}
        {filteredOperations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {filteredOperations.map((op) => (
              <div
                key={op.id}
                className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      #{op.ordinal} {op.id}
                    </span>
                    <span className="font-mono text-sm font-semibold text-cyan-400">{op.path}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={getTierBadgeVariant(op.tier)}>{op.tier}</Badge>
                    {op.trade && <Badge variant="trade">Trade</Badge>}
                    <Badge variant={op.paramReq === 'Required' ? 'default' : 'outline'}>
                      {op.paramReq}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-300">{op.desc}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-800/60 overflow-x-auto">
                    <span className="text-slate-500">params: </span>
                    <span className="text-slate-300">{op.params}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-800/60 overflow-x-auto">
                    <span className="text-slate-500">returns: </span>
                    <span className="text-indigo-300">{op.returns}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
