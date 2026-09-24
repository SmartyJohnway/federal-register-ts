import { Layers, ShieldCheck, Database, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { TOTAL_OPERATIONS_COUNT, ROOT_NAMESPACES, TIER_COUNTS, TRADE_RELEVANT_OPERATIONS } from '../data/registry';

interface ExploreViewProps {
  onNavigateTab: (tab: 'developer' | 'trade' | 'capabilities') => void;
}

export function ExploreView({ onNavigateTab }: ExploreViewProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-8 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <Badge variant="trade" className="text-xs py-1 px-2.5">
            Public SDK Showcase &amp; Reference Architecture
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Federal Register TypeScript SDK
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            A type-safe SDK covering 14 SDK root namespaces with 54 canonical operations,
            standardized query serialization, and a Netlify Functions Node.js 24 server-side architecture.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={() => onNavigateTab('developer')} size="md">
              <span>Developer Preview</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button onClick={() => onNavigateTab('trade')} variant="secondary" size="md">
              <span>Trade Examples Placeholder</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Canonical Operations</span>
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{TOTAL_OPERATIONS_COUNT}</div>
          <p className="text-xs text-slate-400">54 audited operations</p>
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">SDK Root Namespaces</span>
            <Database className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{ROOT_NAMESPACES.length}</div>
          <p className="text-xs text-slate-400">Documents, Agencies, PI, Facets, etc.</p>
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tier Distribution</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white mb-1 flex items-center gap-1.5">
            <span className="text-emerald-400">{TIER_COUNTS['Tier A']} A</span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400">{TIER_COUNTS['Tier B']} B</span>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400">{TIER_COUNTS['Tier C']} C</span>
          </div>
          <p className="text-xs text-slate-400">Audited accessibility tiers</p>
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trade Relevant</span>
            <Layers className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{TRADE_RELEVANT_OPERATIONS.length}</div>
          <p className="text-xs text-slate-400">Operations tagged for trade context</p>
        </Card>
      </div>

      {/* Architecture Notice */}
      <Card>
        <CardHeader>
          <CardTitle>
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>Architecture &amp; Server Boundary Invariant</span>
          </CardTitle>
        </CardHeader>
        <div className="space-y-3 text-sm text-slate-300">
          <p>
            The Showcase operates as an independent private consumer of <code className="text-cyan-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">federal-register-ts@1.1.0</code> published to npm.
            Production execution routes through Netlify Functions on Node.js 24 with an explicit static allowlist, strictly avoiding runtime <code className="text-pink-300 font-mono">eval</code> or unconstrained dynamic object traversal.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-mono">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <div className="text-slate-400 font-semibold mb-1">Frontend Layer</div>
              <div className="text-slate-200">React + Vite + TypeScript 7.0.2</div>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <div className="text-slate-400 font-semibold mb-1">Gateway Runtime</div>
              <div className="text-cyan-400">Netlify Functions (Node.js 24)</div>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <div className="text-slate-400 font-semibold mb-1">SDK Source</div>
              <div className="text-emerald-400">npm: federal-register-ts@1.1.0</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
