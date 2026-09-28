import { useState, useId } from 'react';
import {
  Scale,
  Sparkles,
  ExternalLink,
  Code2,
  FileText,
  Clock,
  Layers,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { LoadingState, ErrorState } from './FeedbackStates';
import {
  TRADE_WORKFLOWS,
  R4_RESPONSIBILITY_BREAKDOWN,
  type TradeWorkflowId,
} from '../data/tradeWorkflows';
import {
  buildSection232SearchParams,
  buildSteelAluminumSearchParams,
  buildCommerceMonitoringParams,
  buildPresidentialTradeParams,
  buildPublicInspectionTradeSearchParams,
  buildFacetedTradeParams,
  generateTradeSnippet,
} from '../lib/tradeRequestBuilders';
import type { DocumentTypeCode } from 'federal-register-ts';

interface TradeExamplesViewProps {
  onNavigateTab?: (tab: 'developer' | 'explore' | 'capabilities') => void;
  onOpenInWorkbench?: (operationId: string) => void;
}

export function TradeExamplesView({
  onNavigateTab: _onNavigateTab,
  onOpenInWorkbench,
}: TradeExamplesViewProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<TradeWorkflowId>('section-232');
  const [showR4Matrix, setShowR4Matrix] = useState(false);

  // Execution States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any | null>(null);
  const [executedOpId, setExecutedOpId] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // E-W1 Section 232 States
  const [s232Term, setS232Term] = useState('Section 232');
  const [s232Type, setS232Type] = useState<string>('');
  const [s232Date, setS232Date] = useState('');

  // E-W2 Steel / Aluminum States
  const [steelPreset, setSteelPreset] = useState<'steel' | 'aluminum' | 'combined' | 'custom'>('steel');
  const [steelCustomTerm, setSteelCustomTerm] = useState('');

  // E-W3 Commerce Monitoring States
  const [commerceTerm, setCommerceTerm] = useState('antidumping');
  const [commerceAgency, setCommerceAgency] = useState('commerce-department');

  // E-W4 Presidential Documents States
  const [presidentialTerm, setPresidentialTerm] = useState('trade');
  const [presidentialDate, setPresidentialDate] = useState('');

  // E-W5 Public Inspection States
  const [piMode, setPiMode] = useState<'current' | 'search'>('current');
  const [piSearchTerm, setPiSearchTerm] = useState('trade');

  // E-W6 Faceted Breakdown States
  const [facetDimension, setFacetDimension] = useState<'agency' | 'docType' | 'yearly'>('agency');
  const [facetTerm, setFacetTerm] = useState('tariff');

  // Form IDs for accessibility
  const s232TermId = useId();
  const s232TypeId = useId();
  const s232DateId = useId();
  const steelCustomTermId = useId();
  const commerceTermId = useId();
  const commerceAgencyId = useId();
  const presidentialTermId = useId();
  const presidentialDateId = useId();
  const piSearchTermId = useId();
  const facetTermId = useId();

  const currentWorkflowDef = TRADE_WORKFLOWS[activeWorkflow];

  // Execution dispatcher through /api/execute gateway
  const executeOperation = async (operationId: string, params?: any) => {
    setIsLoading(true);
    setErrorMsg(null);
    setValidationError(null);
    setResultData(null);
    setExecutedOpId(operationId);

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationId, params }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.validationError) {
          setValidationError(json.validationError);
        } else {
          setErrorMsg(json.error || `HTTP ${res.status}: Failed to execute operation.`);
        }
      } else {
        setResultData(json.data);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error executing SDK request.');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine current active parameters & primary operation
  const getCurrentExecutionInfo = () => {
    switch (activeWorkflow) {
      case 'section-232': {
        const params = buildSection232SearchParams({
          term: s232Term,
          type: s232Type ? (s232Type as DocumentTypeCode) : undefined,
          publicationDate: s232Date,
        });
        return {
          operationId: 'DOC-001',
          operationPath: 'client.documents.search',
          params,
        };
      }
      case 'steel-aluminum': {
        const params = buildSteelAluminumSearchParams({
          preset: steelPreset,
          customTerm: steelCustomTerm,
        });
        return {
          operationId: 'DOC-001',
          operationPath: 'client.documents.search',
          params,
        };
      }
      case 'commerce-monitoring': {
        const params = buildCommerceMonitoringParams({
          term: commerceTerm,
          agency: commerceAgency,
        });
        return {
          operationId: 'DOC-001',
          operationPath: 'client.documents.search',
          params,
        };
      }
      case 'presidential-documents': {
        const params = buildPresidentialTradeParams({
          term: presidentialTerm,
          publicationDate: presidentialDate,
        });
        return {
          operationId: 'DOC-001',
          operationPath: 'client.documents.search',
          params,
        };
      }
      case 'public-inspection': {
        if (piMode === 'current') {
          return {
            operationId: 'PI-003',
            operationPath: 'client.publicInspection.current',
            params: undefined,
          };
        } else {
          const params = buildPublicInspectionTradeSearchParams({
            term: piSearchTerm,
          });
          return {
            operationId: 'PI-001',
            operationPath: 'client.publicInspection.search',
            params,
          };
        }
      }
      case 'faceted-research': {
        let opId = 'DOC-FACET-001';
        let opPath = 'client.documents.facets.agency';
        if (facetDimension === 'docType') {
          opId = 'DOC-FACET-004';
          opPath = 'client.documents.facets.type';
        } else if (facetDimension === 'yearly') {
          opId = 'DOC-FACET-010';
          opPath = 'client.documents.facets.yearly';
        }
        const params = buildFacetedTradeParams({
          dimension: facetDimension,
          term: facetTerm,
        });
        return {
          operationId: opId,
          operationPath: opPath,
          params,
        };
      }
    }
  };

  const currentInfo = getCurrentExecutionInfo();
  const currentSnippet = generateTradeSnippet(
    activeWorkflow,
    currentInfo.params,
    currentInfo.operationPath
  );

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleRunCurrentWorkflow = () => {
    executeOperation(currentInfo.operationId, currentInfo.params);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Policy & Disclaimer Header */}
      <Card className="border-purple-500/30 bg-purple-950/20">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>
              <Scale className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold text-white">
                Federal Register Trade Research Reference
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="trade">R3-10E Reference Surface</Badge>
              <Badge variant="default">federal-register-ts@1.1.0</Badge>
            </div>
          </div>
        </CardHeader>
        <div className="space-y-3 text-sm text-slate-300">
          <p className="leading-relaxed">
            Demonstrates how the official TypeScript SDK queries Federal Register regulatory notices, trade remedy investigations, presidential proclamations, and pre-publication filings.
          </p>
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Trade Policy Boundary:</span>{' '}
              Federal Register research example — verify the underlying official document before relying on it for legal or tariff decisions. This showcase is not a tariff calculator, HTS engine, or legal determination authority.
            </div>
          </div>
          <div className="pt-1 flex items-center justify-between">
            <button
              onClick={() => setShowR4Matrix(!showR4Matrix)}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors font-medium"
            >
              <Layers className="w-4 h-4" />
              {showR4Matrix ? 'Hide R4 Architecture Separation' : 'Show R4 Architecture Separation (SDK vs Handy)'}
            </button>
          </div>
        </div>
      </Card>

      {/* R4 Architecture Separation Card (Collapsible) */}
      {showR4Matrix && (
        <Card className="border-indigo-500/30 bg-slate-900/80 animate-fadeIn">
          <CardHeader>
            <CardTitle>
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>R4 Migration Reference Architecture Breakdown</span>
            </CardTitle>
            <Badge variant="default">53 Call Sites Mapped</Badge>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {R4_RESPONSIBILITY_BREAKDOWN.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1.5"
              >
                <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  {item.category}
                </div>
                <div className="text-slate-300 font-medium">{item.role}</div>
                <div className="text-slate-400 text-[11px]">{item.scope}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 2. Workflow Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {(Object.keys(TRADE_WORKFLOWS) as TradeWorkflowId[]).map((wId) => {
          const w = TRADE_WORKFLOWS[wId];
          const isActive = activeWorkflow === wId;
          return (
            <button
              key={wId}
              onClick={() => {
                setActiveWorkflow(wId);
                setResultData(null);
                setErrorMsg(null);
                setValidationError(null);
              }}
              className={`p-3 text-left rounded-xl border transition-all duration-200 flex flex-col justify-between gap-2 ${
                isActive
                  ? 'bg-purple-900/30 border-purple-500 text-white shadow-lg shadow-purple-950/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold">{w.shortTitle}</span>
                {isActive && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">{w.badge}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Workflow Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Workflow Configuration & Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Research Overview Card */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="trade">{currentWorkflowDef.badge}</Badge>
                  <span className="text-xs font-mono text-slate-400">
                    {currentInfo.operationId}
                  </span>
                </div>
                <CardTitle className="text-lg text-white">
                  {currentWorkflowDef.title}
                </CardTitle>
              </div>
            </CardHeader>

            <div className="space-y-4 text-xs text-slate-300">
              {/* Research Question */}
              <div className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/60 space-y-1">
                <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Research Question
                </div>
                <div className="italic text-slate-200">
                  "{currentWorkflowDef.researchQuestion}"
                </div>
              </div>

              {/* What is being searched */}
              <div>
                <span className="font-semibold text-slate-200">What is Searched: </span>
                <span className="text-slate-400">{currentWorkflowDef.whatIsSearched}</span>
              </div>

              {/* Canonical SDK Operations */}
              <div>
                <span className="font-semibold text-slate-200">Canonical SDK Operation: </span>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {currentWorkflowDef.canonicalOperations.map((op, i) => (
                    <div
                      key={i}
                      className="px-2.5 py-1.5 rounded bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-purple-300 flex items-center gap-2"
                    >
                      <span>{op.path}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400">
                        {op.tier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Interactive Parameters Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                <span>Search Parameters &amp; Conditions</span>
              </CardTitle>
            </CardHeader>

            <div className="space-y-4 text-xs">
              {/* E-W1 Section 232 Form */}
              {activeWorkflow === 'section-232' && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor={s232TermId} className="block text-slate-300 font-medium mb-1">
                      Search Term (conditions.term)
                    </label>
                    <input
                      id={s232TermId}
                      type="text"
                      value={s232Term}
                      onChange={(e) => setS232Term(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="e.g. Section 232, steel exclusion"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={s232TypeId} className="block text-slate-300 font-medium mb-1">
                        Document Type
                      </label>
                      <select
                        id={s232TypeId}
                        value={s232Type}
                        onChange={(e) => setS232Type(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-mono"
                      >
                        <option value="">All Types</option>
                        <option value="RULE">RULE</option>
                        <option value="PRORULE">PRORULE</option>
                        <option value="NOTICE">NOTICE</option>
                        <option value="PRESDOCU">PRESDOCU</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor={s232DateId} className="block text-slate-300 font-medium mb-1">
                        Publication Date
                      </label>
                      <input
                        id={s232DateId}
                        type="date"
                        value={s232Date}
                        onChange={(e) => setS232Date(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* E-W2 Steel / Aluminum Form */}
              {activeWorkflow === 'steel-aluminum' && (
                <div className="space-y-3">
                  <label className="block text-slate-300 font-medium mb-1">
                    Commodity Preset Selection
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['steel', 'aluminum', 'combined', 'custom'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setSteelPreset(p)}
                        className={`px-3 py-2 rounded-lg border text-center font-medium capitalize transition-colors ${
                          steelPreset === p
                            ? 'bg-purple-900/40 border-purple-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  {steelPreset === 'custom' && (
                    <div>
                      <label htmlFor={steelCustomTermId} className="block text-slate-300 font-medium mb-1">
                        Custom Commodity Term
                      </label>
                      <input
                        id={steelCustomTermId}
                        type="text"
                        value={steelCustomTerm}
                        onChange={(e) => setSteelCustomTerm(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-mono"
                        placeholder="e.g. copper, titanium"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* E-W3 Commerce Monitoring Form */}
              {activeWorkflow === 'commerce-monitoring' && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor={commerceAgencyId} className="block text-slate-300 font-medium mb-1">
                      Scoping Agency (conditions.agencies)
                    </label>
                    <select
                      id={commerceAgencyId}
                      value={commerceAgency}
                      onChange={(e) => setCommerceAgency(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-mono"
                    >
                      <option value="commerce-department">Department of Commerce (commerce-department)</option>
                      <option value="international-trade-administration">International Trade Administration (ITA)</option>
                      <option value="industry-and-security-bureau">Bureau of Industry &amp; Security (BIS)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor={commerceTermId} className="block text-slate-300 font-medium mb-1">
                      Monitoring Keyword (conditions.term)
                    </label>
                    <input
                      id={commerceTermId}
                      type="text"
                      value={commerceTerm}
                      onChange={(e) => setCommerceTerm(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="e.g. antidumping, countervailing duty, export control"
                    />
                  </div>
                </div>
              )}

              {/* E-W4 Presidential Documents Form */}
              {activeWorkflow === 'presidential-documents' && (
                <div className="space-y-3">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-400">Fixed Document Type:</span>
                    <Badge variant="trade">conditions.types = ["PRESDOCU"]</Badge>
                  </div>
                  <div>
                    <label htmlFor={presidentialTermId} className="block text-slate-300 font-medium mb-1">
                      Trade Keyword (conditions.term)
                    </label>
                    <input
                      id={presidentialTermId}
                      type="text"
                      value={presidentialTerm}
                      onChange={(e) => setPresidentialTerm(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="e.g. trade, tariff, national emergency"
                    />
                  </div>
                  <div>
                    <label htmlFor={presidentialDateId} className="block text-slate-300 font-medium mb-1">
                      Publication Date (Optional)
                    </label>
                    <input
                      id={presidentialDateId}
                      type="date"
                      value={presidentialDate}
                      onChange={(e) => setPresidentialDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* E-W5 Public Inspection Form */}
              {activeWorkflow === 'public-inspection' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPiMode('current')}
                      className={`px-3 py-2 rounded-lg border text-center font-medium transition-colors ${
                        piMode === 'current'
                          ? 'bg-purple-900/40 border-purple-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Current Feed (PI-003)
                    </button>
                    <button
                      onClick={() => setPiMode('search')}
                      className={`px-3 py-2 rounded-lg border text-center font-medium transition-colors ${
                        piMode === 'search'
                          ? 'bg-purple-900/40 border-purple-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Search Pre-Publication (PI-001)
                    </button>
                  </div>
                  {piMode === 'search' && (
                    <div>
                      <label htmlFor={piSearchTermId} className="block text-slate-300 font-medium mb-1">
                        Pre-Publication Term (conditions.term)
                      </label>
                      <input
                        id={piSearchTermId}
                        type="text"
                        value={piSearchTerm}
                        onChange={(e) => setPiSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-mono"
                        placeholder="e.g. trade, customs, tariff"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* E-W6 Faceted Research Form */}
              {activeWorkflow === 'faceted-research' && (
                <div className="space-y-3">
                  <label className="block text-slate-300 font-medium mb-1">
                    Aggregation Dimension
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setFacetDimension('agency')}
                      className={`px-3 py-2 rounded-lg border text-center font-medium transition-colors ${
                        facetDimension === 'agency'
                          ? 'bg-purple-900/40 border-purple-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      By Agency
                    </button>
                    <button
                      onClick={() => setFacetDimension('docType')}
                      className={`px-3 py-2 rounded-lg border text-center font-medium transition-colors ${
                        facetDimension === 'docType'
                          ? 'bg-purple-900/40 border-purple-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      By Doc Type
                    </button>
                    <button
                      onClick={() => setFacetDimension('yearly')}
                      className={`px-3 py-2 rounded-lg border text-center font-medium transition-colors ${
                        facetDimension === 'yearly'
                          ? 'bg-purple-900/40 border-purple-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      By Year
                    </button>
                  </div>
                  <div>
                    <label htmlFor={facetTermId} className="block text-slate-300 font-medium mb-1">
                      Facet Scope Term (conditions.term)
                    </label>
                    <input
                      id={facetTermId}
                      type="text"
                      value={facetTerm}
                      onChange={(e) => setFacetTerm(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="e.g. tariff, antidumping, subsidy"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleRunCurrentWorkflow}
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/30"
                >
                  {isLoading ? 'Executing SDK Operation...' : 'Execute Trade Research Request'}
                </Button>
              </div>
            </div>
          </Card>

          {/* R4 Migration Relevance Card */}
          <Card className="border-indigo-500/20 bg-indigo-950/10">
            <CardHeader>
              <CardTitle className="text-xs flex items-center gap-2 text-indigo-300">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>R4 Migration Relevance Note</span>
              </CardTitle>
              <Badge variant="default">{currentWorkflowDef.r4MigrationRelevance.r4Responsibility}</Badge>
            </CardHeader>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 font-semibold">Legacy Handy: </span>
                <span>{currentWorkflowDef.r4MigrationRelevance.legacyHandyApproach}</span>
              </div>
              <div>
                <span className="text-purple-300 font-semibold">Canonical SDK: </span>
                <span>{currentWorkflowDef.r4MigrationRelevance.canonicalSdkApproach}</span>
              </div>
              <div className="pt-1.5 border-t border-indigo-900/40 text-[11px] text-indigo-200">
                <span className="font-semibold">Action: </span>
                {currentWorkflowDef.r4MigrationRelevance.action}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Execution Output & Code Snippet (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Results Card */}
          <Card className="min-h-[380px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between w-full flex-wrap gap-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Research Results &amp; Document Previews</span>
                </CardTitle>
                {executedOpId && (
                  <Badge variant="trade">Executed: {executedOpId}</Badge>
                )}
              </div>
            </CardHeader>

            <div className="p-4 flex-1 flex flex-col justify-center">
              {isLoading && <LoadingState message="Executing Federal Register research request..." />}

              {validationError && (
                <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                  <div className="font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>SDK Parameter Validation Error</span>
                  </div>
                  <div className="font-mono text-[11px]">{validationError}</div>
                </div>
              )}

              {errorMsg && (
                <ErrorState message={errorMsg} />
              )}

              {!isLoading && !errorMsg && !validationError && !resultData && (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                  <p className="text-xs">Click "Execute Trade Research Request" to run this workflow through the SDK gateway.</p>
                </div>
              )}

              {!isLoading && !errorMsg && !validationError && resultData && (
                <div className="space-y-4">
                  {/* Results Count Summary */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <div>
                      {resultData.count !== undefined && (
                        <span>Found <strong className="text-white font-mono">{resultData.count}</strong> matching records</span>
                      )}
                      {resultData.total !== undefined && (
                        <span>Total: <strong className="text-white font-mono">{resultData.total}</strong></span>
                      )}
                    </div>
                    {onOpenInWorkbench && executedOpId && (
                      <button
                        onClick={() => onOpenInWorkbench(executedOpId)}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                      >
                        Inspect in Workbench <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Documents List Rendering */}
                  {Array.isArray(resultData.results) && (
                    <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                      {resultData.results.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-purple-500/40 transition-colors space-y-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-xs font-semibold text-slate-200 line-clamp-2">
                              {item.title || item.document_number || 'Untitled Document'}
                            </h4>
                            {item.html_url && (
                              <a
                                href={item.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-400 hover:text-purple-300 p-1 shrink-0"
                                title="View on FederalRegister.gov"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
                            {item.document_number && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {item.document_number}
                              </span>
                            )}
                            {item.type && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300">
                                {item.type}
                              </span>
                            )}
                            {item.publication_date && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Clock className="w-3 h-3" />
                                {item.publication_date}
                              </span>
                            )}
                            {item.agencies && item.agencies.length > 0 && (
                              <span className="text-slate-400">
                                {item.agencies.map((a: any) => a.raw_name || a.name).join(', ')}
                              </span>
                            )}
                          </div>
                          {item.abstract && (
                            <p className="text-[11px] text-slate-400 line-clamp-2">
                              {item.abstract}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Public Inspection Direct Array */}
                  {!resultData.results && Array.isArray(resultData) && (
                    <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                      {resultData.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-xs font-semibold text-slate-200 line-clamp-2">
                              {item.title || item.document_number}
                            </span>
                            {item.html_url && (
                              <a
                                href={item.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-400 hover:text-purple-300 p-1 shrink-0"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                            {item.filing_date && <span>Filed: {item.filing_date}</span>}
                            {item.publication_date && <span>Publishes: {item.publication_date}</span>}
                            {item.num_pages && <span>Pages: {item.num_pages}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Facet Summary / Object Breakdown */}
                  {!resultData.results && !Array.isArray(resultData) && typeof resultData === 'object' && (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto font-mono text-xs">
                      {Object.entries(resultData).map(([k, v], idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800"
                        >
                          <span className="text-slate-300">{k}</span>
                          <Badge variant="trade">{String(v)}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* 4. Copyable TypeScript Code Snippet */}
          <Card className="border-slate-800 bg-slate-950/80">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-xs flex items-center gap-2 text-slate-300">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <span>Exact TypeScript SDK Request Implementation</span>
                </CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopySnippet}
                  className="text-xs flex items-center gap-1.5"
                >
                  {copiedSnippet ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <div className="p-4 pt-0">
              <pre className="p-3.5 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-[11px] text-purple-200 overflow-x-auto leading-relaxed">
                {currentSnippet}
              </pre>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
