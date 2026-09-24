import { useState } from 'react';
import { Copy, Check, Terminal, FileCode2, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import { CANONICAL_OPERATIONS } from '../data/registry';
import type { OperationTier } from '../types/registry';

export function DeveloperView() {
  const [copied, setCopied] = useState(false);

  // Foundation preview: static sample showing first 5 operations across tiers
  const sampleOperations = CANONICAL_OPERATIONS.slice(0, 6);

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
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">SDK Basic Import Example</div>
            <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
{`import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

// Primary document search (Tier A)
const results = await client.documents.search({
  conditions: { term: 'tariff rate quota' },
  perPage: 10,
});

console.log(\`Found \${results.count} documents\`);`}
            </pre>
          </div>
        </div>
      </Card>

      {/* Operation Catalog Foundation Preview */}
      <Card>
        <CardHeader>
          <CardTitle>
            <FileCode2 className="w-5 h-5 text-indigo-400" />
            <span>Canonical Registry Foundation Preview</span>
          </CardTitle>
          <Badge variant="outline">Full Explorer in R3-10C</Badge>
        </CardHeader>

        <p className="text-xs text-slate-400 mb-4">
          Below is a foundation sample of the 54 canonical operations carried by the Showcase metadata registry.
          Full interactive capability exploration and parameter builder will be enabled in checkpoint R3-10C.
        </p>

        <div className="space-y-3">
          {sampleOperations.map((op) => (
            <div
              key={op.id}
              className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2"
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
      </Card>
    </div>
  );
}
