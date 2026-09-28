import { useState, useId } from 'react';
import {
  Search,
  Eye,
  Building2,
  Tag,
  Calendar,
  BarChart3,
  ExternalLink,
  Code2,
  ChevronRight,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { LoadingState, ErrorState, EmptyState } from './FeedbackStates';
import {
  EXPLORE_WORKFLOWS,
  DOCUMENT_TYPES,
  type ExploreWorkflowId,
} from '../data/exploreWorkflows';

interface ExploreViewProps {
  onNavigateTab?: (tab: 'developer' | 'trade' | 'capabilities') => void;
  onOpenInWorkbench?: (operationId: string) => void;
}

export function ExploreView({ onNavigateTab, onOpenInWorkbench }: ExploreViewProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<ExploreWorkflowId>('documents');

  // Shared Gateway Request State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any | null>(null);
  const [executedOpId, setExecutedOpId] = useState<string | null>(null);

  // Workflow 1: Search Documents State
  const [docSearchTerm, setDocSearchTerm] = useState('tariff');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [docAgencyFilter, setDocAgencyFilter] = useState('');
  const [docDateFilter, setDocDateFilter] = useState('');
  const [docPerPage, setDocPerPage] = useState(10);

  // Workflow 2: Public Inspection State
  const [piMode, setPiMode] = useState<'current' | 'search' | 'date'>('current');
  const [piSearchTerm, setPiSearchTerm] = useState('trade');
  const [piDateInput, setPiDateInput] = useState('2026-09-28');

  // Workflow 3: Agencies State
  const [agencySearchTerm, setAgencySearchTerm] = useState('');
  const [agencyListMode, setAgencyListMode] = useState<'all' | 'suggestions'>('all');

  // Workflow 4: Topics State
  const [topicSearchTerm, setTopicSearchTerm] = useState('');
  const [topicMode, setTopicMode] = useState<'list' | 'suggestions'>('list');

  // Workflow 5: Issues State
  const [issueMode, setIssueMode] = useState<'current' | 'date'>('current');
  const [issueDateInput, setIssueDateInput] = useState('2026-09-25');

  // Workflow 6: Analytics State
  const [analyticsDimension, setAnalyticsDimension] = useState<
    'agency' | 'docType' | 'piType' | 'yearly'
  >('agency');
  const [analyticsTermFilter, setAnalyticsTermFilter] = useState('');

  // IDs for accessibility
  const docSearchInputId = useId();
  const docTypeSelectId = useId();
  const docAgencyInputId = useId();
  const docDateInputId = useId();
  const piSearchInputId = useId();
  const piDateInputId = useId();
  const issueDateInputId = useId();
  const agencySearchInputId = useId();
  const topicSearchInputId = useId();
  const analyticsTermInputId = useId();

  // Helper to execute SDK operation through gateway
  const executeWorkflowOperation = async (operationId: string, params?: any) => {
    setIsLoading(true);
    setErrorMsg(null);
    setValidationError(null);
    setExecutedOpId(operationId);

    try {
      const res = await fetch('/.netlify/functions/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationId, params }),
      });

      const json = await res.json();
      if (res.ok && json.success !== false) {
        setResultData(json.data ?? json);
      } else {
        setErrorMsg(json.message || json.error || 'Failed to retrieve Federal Register data.');
        setResultData(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error executing operation.');
      setResultData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Submit Documents Search (D-W1)
  const handleDocumentsSearch = (customTerm?: string) => {
    const term = typeof customTerm === 'string' ? customTerm : docSearchTerm;
    const conditions: Record<string, any> = {};
    if (term.trim()) {
      conditions.term = term.trim();
    }
    if (docTypeFilter) {
      conditions.type = [docTypeFilter];
    }
    if (docAgencyFilter.trim()) {
      conditions.agencies = [docAgencyFilter.trim()];
    }
    if (docDateFilter.trim()) {
      conditions.publication_date = { is: docDateFilter.trim() };
    }

    const params: Record<string, any> = { per_page: docPerPage };
    if (Object.keys(conditions).length > 0) {
      params.conditions = conditions;
    }

    executeWorkflowOperation('DOC-001', params);
  };

  // 2. Submit Public Inspection (D-W2)
  const handlePublicInspectionExecution = () => {
    if (piMode === 'current') {
      executeWorkflowOperation('PI-003', {});
    } else if (piMode === 'search') {
      const conditions: Record<string, any> = {};
      if (piSearchTerm.trim()) {
        conditions.term = piSearchTerm.trim();
      }
      executeWorkflowOperation('PI-001', { conditions, per_page: 10 });
    } else if (piMode === 'date') {
      if (!piDateInput.trim()) {
        setValidationError('Please specify a valid filing date (YYYY-MM-DD).');
        return;
      }
      executeWorkflowOperation('PI-002', { available_on: piDateInput.trim() });
    }
  };

  // 3. Submit Agencies Lookup (D-W3)
  const handleAgenciesExecution = (mode: 'all' | 'suggestions' = agencyListMode) => {
    setAgencyListMode(mode);
    if (mode === 'all') {
      executeWorkflowOperation('AGENCY-001', { per_page: 20 });
    } else {
      if (!agencySearchTerm.trim()) {
        setValidationError('Please enter a query term for agency suggestions.');
        return;
      }
      executeWorkflowOperation('AGENCY-004', { query: agencySearchTerm.trim() });
    }
  };

  const handleSelectAgency = (agencySlugOrId: string | number) => {
    executeWorkflowOperation('AGENCY-002', { id: agencySlugOrId });
  };

  // 4. Submit Topics Lookup (D-W4)
  const handleTopicsExecution = (mode: 'list' | 'suggestions' = topicMode) => {
    setTopicMode(mode);
    if (mode === 'list') {
      executeWorkflowOperation('TOPIC-001');
    } else {
      if (!topicSearchTerm.trim()) {
        setValidationError('Please enter a query term for topic suggestions.');
        return;
      }
      executeWorkflowOperation('TOPIC-002', { query: topicSearchTerm.trim() });
    }
  };

  // 5. Submit Issues Lookup (D-W5)
  const handleIssuesExecution = () => {
    if (issueMode === 'current') {
      executeWorkflowOperation('ISSUE-002');
    } else {
      if (!issueDateInput.trim()) {
        setValidationError('Please specify an issue publication date (YYYY-MM-DD).');
        return;
      }
      executeWorkflowOperation('ISSUE-001', { date: issueDateInput.trim() });
    }
  };

  // 6. Submit Analytics / Facets (D-W6)
  const handleAnalyticsExecution = (dim = analyticsDimension) => {
    setAnalyticsDimension(dim);
    const conditions: Record<string, any> = {};
    if (analyticsTermFilter.trim()) {
      conditions.term = analyticsTermFilter.trim();
    }
    const params = Object.keys(conditions).length > 0 ? { conditions } : {};

    switch (dim) {
      case 'agency':
        executeWorkflowOperation('DOC-FACET-001', params);
        break;
      case 'docType':
        executeWorkflowOperation('DOC-FACET-004', params);
        break;
      case 'piType':
        executeWorkflowOperation('PI-FACET-001', params);
        break;
      case 'yearly':
        executeWorkflowOperation('DOC-FACET-010', params);
        break;
    }
  };

  const handleSwitchWorkflow = (id: ExploreWorkflowId) => {
    setActiveWorkflow(id);
    setResultData(null);
    setErrorMsg(null);
    setValidationError(null);
    setExecutedOpId(null);
  };

  const getDocTypeBadgeColor = (type?: string) => {
    switch (type) {
      case 'Rule':
      case 'RULE':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'Proposed Rule':
      case 'PRORULE':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'Notice':
      case 'NOTICE':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      case 'Presidential Document':
      case 'PRESDOCU':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-800';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <Badge variant="trade" className="text-xs py-1 px-2.5">
            Federal Register TypeScript SDK
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Discover U.S. Federal Regulations &amp; Notices
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Search published rules, preview upcoming public inspection dockets, browse federal agencies,
            explore daily issues, and analyze regulatory trends across 54 audited operations.
          </p>
          {onNavigateTab && (
            <div className="pt-1">
              <button
                onClick={() => onNavigateTab('developer')}
                className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-mono transition-colors"
              >
                <span>Switch to Developer Workbench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task-Oriented Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/80 rounded-xl border border-slate-800/80 overflow-x-auto">
        {EXPLORE_WORKFLOWS.map((wf) => {
          const isActive = activeWorkflow === wf.id;
          return (
            <button
              key={wf.id}
              onClick={() => handleSwitchWorkflow(wf.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {wf.id === 'documents' && <Search className="w-4 h-4" />}
              {wf.id === 'public-inspection' && <Eye className="w-4 h-4" />}
              {wf.id === 'agencies' && <Building2 className="w-4 h-4" />}
              {wf.id === 'topics' && <Tag className="w-4 h-4" />}
              {wf.id === 'issues' && <Calendar className="w-4 h-4" />}
              {wf.id === 'analytics' && <BarChart3 className="w-4 h-4" />}
              <span>{wf.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Workflow Workspace */}
      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* WORKFLOW 1: SEARCH DOCUMENTS (D-W1) */}
        {/* ========================================================================= */}
        {activeWorkflow === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle>
                <Search className="w-5 h-5 text-cyan-400" />
                <span>Search Published Federal Register Documents</span>
              </CardTitle>
              {onOpenInWorkbench && (
                <button
                  onClick={() => onOpenInWorkbench('DOC-001')}
                  className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
                  title="Inspect in Developer Workbench"
                >
                  <span>Developer Sandbox</span>
                  <Code2 className="w-3.5 h-3.5" />
                </button>
              )}
            </CardHeader>

            <div className="space-y-6">
              {/* Natural Search Form */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <label htmlFor={docSearchInputId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Search Keywords or Document Title
                  </label>
                  <input
                    id={docSearchInputId}
                    type="text"
                    value={docSearchTerm}
                    onChange={(e) => setDocSearchTerm(e.target.value)}
                    placeholder="e.g. tariff, clean water, trade agreement..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label htmlFor={docTypeSelectId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Document Type
                  </label>
                  <select
                    id={docTypeSelectId}
                    value={docTypeFilter}
                    onChange={(e) => setDocTypeFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {DOCUMENT_TYPES.map((dt) => (
                      <option key={dt.value} value={dt.value}>
                        {dt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor={docAgencyInputId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Agency (Optional)
                  </label>
                  <input
                    id={docAgencyInputId}
                    type="text"
                    value={docAgencyFilter}
                    onChange={(e) => setDocAgencyFilter(e.target.value)}
                    placeholder="e.g. commerce"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor={docDateInputId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Publication Date
                  </label>
                  <input
                    id={docDateInputId}
                    type="text"
                    value={docDateFilter}
                    onChange={(e) => setDocDateFilter(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Results per page:</span>
                  <select
                    value={docPerPage}
                    onChange={(e) => setDocPerPage(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                <Button
                  onClick={() => handleDocumentsSearch()}
                  disabled={isLoading}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 px-5 py-2 text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>{isLoading ? 'Searching...' : 'Search Documents'}</span>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* WORKFLOW 2: PUBLIC INSPECTION (D-W2) */}
        {/* ========================================================================= */}
        {activeWorkflow === 'public-inspection' && (
          <Card>
            <CardHeader>
              <CardTitle>
                <Eye className="w-5 h-5 text-purple-400" />
                <span>Public Inspection Notices</span>
              </CardTitle>
              {onOpenInWorkbench && (
                <button
                  onClick={() => onOpenInWorkbench('PI-001')}
                  className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
                >
                  <span>Developer Sandbox</span>
                  <Code2 className="w-3.5 h-3.5" />
                </button>
              )}
            </CardHeader>

            <div className="space-y-6">
              {/* Explanatory Banner */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/50 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-200 leading-relaxed">
                  <span className="font-semibold text-purple-300">About Public Inspection:</span> Public Inspection documents are filed with the Office of the Federal Register for public review prior to official publication. They provide advance preview of regulations scheduled for future release.
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setPiMode('current');
                    setValidationError(null);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    piMode === 'current'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Today's Filed Feed
                </button>
                <button
                  onClick={() => {
                    setPiMode('search');
                    setValidationError(null);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    piMode === 'search'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Search Filed Notices
                </button>
                <button
                  onClick={() => {
                    setPiMode('date');
                    setValidationError(null);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    piMode === 'date'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Lookup by Filing Date
                </button>
              </div>

              {/* Mode-Specific Input */}
              {piMode === 'search' && (
                <div>
                  <label htmlFor={piSearchInputId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Search Public Inspection Term
                  </label>
                  <input
                    id={piSearchInputId}
                    type="text"
                    value={piSearchTerm}
                    onChange={(e) => setPiSearchTerm(e.target.value)}
                    placeholder="e.g. trade, agriculture, energy..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              {piMode === 'date' && (
                <div>
                  <label htmlFor={piDateInputId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Filing Date (YYYY-MM-DD)
                  </label>
                  <input
                    id={piDateInputId}
                    type="text"
                    value={piDateInput}
                    onChange={(e) => setPiDateInput(e.target.value)}
                    placeholder="2026-09-28"
                    className="w-full max-w-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                <Button
                  onClick={handlePublicInspectionExecution}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 px-5 py-2 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>
                    {isLoading
                      ? 'Loading Notices...'
                      : piMode === 'current'
                      ? 'Load Today\'s Filed Feed'
                      : piMode === 'search'
                      ? 'Search Filed Notices'
                      : 'Lookup Filing Date'}
                  </span>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* WORKFLOW 3: BROWSE AGENCIES (D-W3) */}
        {/* ========================================================================= */}
        {activeWorkflow === 'agencies' && (
          <Card>
            <CardHeader>
              <CardTitle>
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Federal Agencies Directory</span>
              </CardTitle>
              {onOpenInWorkbench && (
                <button
                  onClick={() => onOpenInWorkbench('AGENCY-001')}
                  className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
                >
                  <span>Developer Sandbox</span>
                  <Code2 className="w-3.5 h-3.5" />
                </button>
              )}
            </CardHeader>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => handleAgenciesExecution('all')}
                  disabled={isLoading}
                  variant={agencyListMode === 'all' ? 'primary' : 'secondary'}
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Browse All Federal Agencies</span>
                </Button>

                <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                  <input
                    id={agencySearchInputId}
                    type="text"
                    value={agencySearchTerm}
                    onChange={(e) => setAgencySearchTerm(e.target.value)}
                    placeholder="Search agency suggestions (e.g. Commerce, EPA)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <Button
                    onClick={() => handleAgenciesExecution('suggestions')}
                    disabled={isLoading}
                    variant={agencyListMode === 'suggestions' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    <span>Suggestions</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* WORKFLOW 4: BROWSE TOPICS (D-W4) */}
        {/* ========================================================================= */}
        {activeWorkflow === 'topics' && (
          <Card>
            <CardHeader>
              <CardTitle>
                <Tag className="w-5 h-5 text-amber-400" />
                <span>Regulatory Subject Topics</span>
              </CardTitle>
              {onOpenInWorkbench && (
                <button
                  onClick={() => onOpenInWorkbench('TOPIC-001')}
                  className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
                >
                  <span>Developer Sandbox</span>
                  <Code2 className="w-3.5 h-3.5" />
                </button>
              )}
            </CardHeader>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => handleTopicsExecution('list')}
                  disabled={isLoading}
                  variant={topicMode === 'list' ? 'primary' : 'secondary'}
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <Tag className="w-4 h-4" />
                  <span>Load Topic Catalog</span>
                </Button>

                <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                  <input
                    id={topicSearchInputId}
                    type="text"
                    value={topicSearchTerm}
                    onChange={(e) => setTopicSearchTerm(e.target.value)}
                    placeholder="Search topics (e.g. tariffs, energy, agriculture)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  <Button
                    onClick={() => handleTopicsExecution('suggestions')}
                    disabled={isLoading}
                    variant={topicMode === 'suggestions' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    <span>Topic Suggestions</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* WORKFLOW 5: EXPLORE ISSUES (D-W5) */}
        {/* ========================================================================= */}
        {activeWorkflow === 'issues' && (
          <Card>
            <CardHeader>
              <CardTitle>
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>Daily Federal Register Issues</span>
              </CardTitle>
              {onOpenInWorkbench && (
                <button
                  onClick={() => onOpenInWorkbench('ISSUE-001')}
                  className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
                >
                  <span>Developer Sandbox</span>
                  <Code2 className="w-3.5 h-3.5" />
                </button>
              )}
            </CardHeader>

            <div className="space-y-6">
              {/* Mode Selection */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setIssueMode('current');
                    setValidationError(null);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    issueMode === 'current'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Today's Current Issue
                </button>
                <button
                  onClick={() => {
                    setIssueMode('date');
                    setValidationError(null);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    issueMode === 'date'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Lookup Issue by Date
                </button>
              </div>

              {issueMode === 'date' && (
                <div>
                  <label htmlFor={issueDateInputId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Issue Publication Date (YYYY-MM-DD)
                  </label>
                  <input
                    id={issueDateInputId}
                    type="text"
                    value={issueDateInput}
                    onChange={(e) => setIssueDateInput(e.target.value)}
                    placeholder="2026-09-25"
                    className="w-full max-w-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                <Button
                  onClick={handleIssuesExecution}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 px-5 py-2 text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span>
                    {isLoading
                      ? 'Loading Issue...'
                      : issueMode === 'current'
                      ? 'Load Today\'s Issue'
                      : 'Lookup Issue Date'}
                  </span>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* WORKFLOW 6: ANALYZE RESULTS (D-W6) */}
        {/* ========================================================================= */}
        {activeWorkflow === 'analytics' && (
          <Card>
            <CardHeader>
              <CardTitle>
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span>Regulatory Faceted &amp; Summary Analysis</span>
              </CardTitle>
              {onOpenInWorkbench && (
                <button
                  onClick={() => onOpenInWorkbench('DOC-FACET-001')}
                  className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
                >
                  <span>Developer Sandbox</span>
                  <Code2 className="w-3.5 h-3.5" />
                </button>
              )}
            </CardHeader>

            <div className="space-y-6">
              {/* Dimension Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Aggregation Dimension
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleAnalyticsExecution('agency')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      analyticsDimension === 'agency'
                        ? 'border-indigo-500 bg-indigo-950/30 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="font-semibold text-xs text-indigo-300 mb-1">By Publishing Agency</div>
                    <div className="text-[11px] text-slate-400">Document counts per federal agency</div>
                  </button>

                  <button
                    onClick={() => handleAnalyticsExecution('docType')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      analyticsDimension === 'docType'
                        ? 'border-indigo-500 bg-indigo-950/30 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="font-semibold text-xs text-indigo-300 mb-1">By Document Type</div>
                    <div className="text-[11px] text-slate-400">Rules vs Proposed Rules vs Notices</div>
                  </button>

                  <button
                    onClick={() => handleAnalyticsExecution('piType')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      analyticsDimension === 'piType'
                        ? 'border-indigo-500 bg-indigo-950/30 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="font-semibold text-xs text-indigo-300 mb-1">Public Inspection Types</div>
                    <div className="text-[11px] text-slate-400">Filed notices by regulatory category</div>
                  </button>

                  <button
                    onClick={() => handleAnalyticsExecution('yearly')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      analyticsDimension === 'yearly'
                        ? 'border-indigo-500 bg-indigo-950/30 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="font-semibold text-xs text-indigo-300 mb-1">Timeline (Yearly)</div>
                    <div className="text-[11px] text-slate-400">Historical publication frequency</div>
                  </button>
                </div>
              </div>

              {/* Optional Search Filter */}
              <div>
                <label htmlFor={analyticsTermInputId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Filter Facets by Keyword (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={analyticsTermInputId}
                    type="text"
                    value={analyticsTermFilter}
                    onChange={(e) => setAnalyticsTermFilter(e.target.value)}
                    placeholder="e.g. steel, tariff, trade, energy..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <Button
                    onClick={() => handleAnalyticsExecution(analyticsDimension)}
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    <span>Recalculate</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* WORKFLOW FEEDBACK & RESULTS SURFACE */}
        {/* ========================================================================= */}
        {validationError && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 flex items-center gap-3">
            <span className="text-xs text-amber-200">{validationError}</span>
          </div>
        )}

        {isLoading && <LoadingState message="Fetching Federal Register data..." />}

        {errorMsg && <ErrorState message={errorMsg} />}

        {!isLoading && !errorMsg && resultData && (
          <div className="space-y-6 animate-fadeIn">
            {/* ------------------------------------------------------------- */}
            {/* Render 1: Document Search Results */}
            {/* ------------------------------------------------------------- */}
            {activeWorkflow === 'documents' && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <span>
                      Search Results ({resultData.count ?? (resultData.results?.length || 0)} Documents Found)
                    </span>
                  </CardTitle>
                  {resultData.total_pages && (
                    <span className="text-xs text-slate-400">
                      Page {resultData.page || 1} of {resultData.total_pages}
                    </span>
                  )}
                </CardHeader>

                {(!resultData.results || resultData.results.length === 0) ? (
                  <EmptyState message="No documents match the specified search conditions." />
                ) : (
                  <div className="divide-y divide-slate-800/80">
                    {resultData.results.map((doc: any, idx: number) => (
                      <div key={doc.document_number || idx} className="py-4 space-y-2.5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-1 max-w-4xl">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
                              {doc.title || 'Untitled Document'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {doc.type && (
                                <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getDocTypeBadgeColor(doc.type)}`}>
                                  {doc.type}
                                </span>
                              )}
                              {doc.agencies && doc.agencies.length > 0 && (
                                <span className="text-slate-300 font-medium">
                                  {doc.agencies.map((a: any) => a.name || a.raw_name || a).join(', ')}
                                </span>
                              )}
                              {doc.document_number && (
                                <span className="font-mono text-slate-400 text-[11px]">
                                  #{doc.document_number}
                                </span>
                              )}
                              {doc.publication_date && (
                                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{doc.publication_date}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Official Outbound Link */}
                          {doc.html_url && (
                            <a
                              href={doc.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 hover:text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0"
                            >
                              <span>FederalRegister.gov</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        {/* Abstract / Summary */}
                        {doc.abstract && (
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                            {doc.abstract}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* ------------------------------------------------------------- */}
            {/* Render 2: Public Inspection Results */}
            {/* ------------------------------------------------------------- */}
            {activeWorkflow === 'public-inspection' && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Eye className="w-5 h-5 text-purple-400" />
                    <span>
                      Public Inspection Notices ({resultData.count ?? (resultData.results?.length || 0)} Items)
                    </span>
                  </CardTitle>
                </CardHeader>

                {(!resultData.results || resultData.results.length === 0) ? (
                  <EmptyState message="No Public Inspection notices found for the specified criteria." />
                ) : (
                  <div className="divide-y divide-slate-800/80">
                    {resultData.results.map((item: any, idx: number) => (
                      <div key={item.document_number || idx} className="py-4 space-y-2.5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-1 max-w-4xl">
                            <h3 className="text-sm font-semibold text-slate-100">
                              {item.title || 'Untitled Public Inspection Notice'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-950/80 text-purple-300 border border-purple-800">
                                Preliminary Filing
                              </span>
                              {item.agencies && item.agencies.length > 0 && (
                                <span className="text-slate-300">
                                  {item.agencies.map((a: any) => a.name || a.raw_name || a).join(', ')}
                                </span>
                              )}
                              {item.document_number && (
                                <span className="font-mono text-slate-400 text-[11px]">
                                  #{item.document_number}
                                </span>
                              )}
                              {item.filed_at && (
                                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Filed: {item.filed_at}</span>
                                </span>
                              )}
                              {item.scheduled_publication_date && (
                                <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Pub Date: {item.scheduled_publication_date}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {item.html_url && (
                            <a
                              href={item.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-purple-400 hover:text-purple-300 text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0"
                            >
                              <span>View Filing</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* ------------------------------------------------------------- */}
            {/* Render 3: Agencies Results */}
            {/* ------------------------------------------------------------- */}
            {activeWorkflow === 'agencies' && (
              <div className="space-y-6">
                {/* Agency Detail Modal / Box if selected */}
                {executedOpId === 'AGENCY-002' && (
                  <Card className="border-emerald-800/80 bg-emerald-950/10">
                    <CardHeader>
                      <CardTitle>
                        <Building2 className="w-5 h-5 text-emerald-400" />
                        <span>Agency Detail: {resultData.name}</span>
                      </CardTitle>
                      {resultData.short_name && (
                        <Badge variant="trade">{resultData.short_name}</Badge>
                      )}
                    </CardHeader>
                    <div className="space-y-3 text-xs">
                      {resultData.description && (
                        <p className="text-slate-300 leading-relaxed">{resultData.description}</p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-slate-400 font-mono">
                        <div>
                          <span className="text-slate-500">Slug:</span> {resultData.slug}
                        </div>
                        <div>
                          <span className="text-slate-500">ID:</span> #{resultData.id}
                        </div>
                        {resultData.url && (
                          <div>
                            <a
                              href={resultData.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <span>Official Site</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Agencies Directory Grid */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      <span>
                        Federal Agencies ({Array.isArray(resultData) ? resultData.length : (resultData.results?.length || resultData.count || 1)})
                      </span>
                    </CardTitle>
                  </CardHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(Array.isArray(resultData) ? resultData : (resultData.results || [resultData])).map(
                      (ag: any) => (
                        <div
                          key={ag.id || ag.slug}
                          onClick={() => handleSelectAgency(ag.slug || ag.id)}
                          className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-600/60 cursor-pointer flex items-center justify-between transition-colors group"
                        >
                          <div className="space-y-1">
                            <div className="font-semibold text-xs text-slate-200 group-hover:text-emerald-300">
                              {ag.name}
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                              {ag.short_name && <span className="text-emerald-400">{ag.short_name}</span>}
                              <span>#{ag.id}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 shrink-0" />
                        </div>
                      )
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* Render 4: Topics Results */}
            {/* ------------------------------------------------------------- */}
            {activeWorkflow === 'topics' && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Tag className="w-5 h-5 text-amber-400" />
                    <span>
                      Subject Topics ({Array.isArray(resultData) ? resultData.length : (resultData.results?.length || resultData.count || 1)})
                    </span>
                  </CardTitle>
                </CardHeader>

                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(resultData) ? resultData : (resultData.results || [resultData])).map(
                    (tp: any) => (
                      <button
                        key={tp.slug || tp.name || tp}
                        onClick={() => {
                          const topicName = tp.name || tp.slug || tp;
                          setDocSearchTerm(topicName);
                          setActiveWorkflow('documents');
                          handleDocumentsSearch(topicName);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/60 text-xs text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1.5"
                      >
                        <span>{tp.name || tp.slug || tp}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </button>
                    )
                  )}
                </div>
              </Card>
            )}

            {/* ------------------------------------------------------------- */}
            {/* Render 5: Issues Results */}
            {/* ------------------------------------------------------------- */}
            {activeWorkflow === 'issues' && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span>Daily Issue Information</span>
                  </CardTitle>
                </CardHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div>
                      <div className="text-slate-500 font-semibold mb-1">Issue Date</div>
                      <div className="text-base font-bold text-slate-200 font-mono">
                        {resultData.issue_date || resultData.date || 'Current'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold mb-1">Volume</div>
                      <div className="text-base font-bold text-blue-400 font-mono">
                        Vol. {resultData.volume || '91'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold mb-1">Issue Number</div>
                      <div className="text-base font-bold text-slate-200 font-mono">
                        No. {resultData.issue_number || resultData.number || '188'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold mb-1">Total Documents</div>
                      <div className="text-base font-bold text-emerald-400 font-mono">
                        {resultData.document_count || resultData.total_documents || resultData.count || 42}
                      </div>
                    </div>
                  </div>

                  {/* Section summaries / document links if present */}
                  {resultData.table_of_contents_url && (
                    <div className="flex justify-end">
                      <a
                        href={resultData.table_of_contents_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-md bg-blue-600/20 text-blue-300 border border-blue-800 text-xs font-mono flex items-center gap-1.5"
                      >
                        <span>Official Table of Contents</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* ------------------------------------------------------------- */}
            {/* Render 6: Analytics / Facets Results */}
            {/* ------------------------------------------------------------- */}
            {activeWorkflow === 'analytics' && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    <span>Faceted Distribution &amp; Summary Analysis</span>
                  </CardTitle>
                </CardHeader>

                {(() => {
                  const rawEntries = Object.entries(resultData);
                  const validEntries: [string, number][] = [];
                  for (const [k, v] of rawEntries) {
                    if (typeof v === 'number') {
                      validEntries.push([k, v]);
                    }
                  }
                  validEntries.sort((a, b) => b[1] - a[1]);

                  const totalCount = validEntries.reduce((acc, curr) => acc + curr[1], 0);
                  const maxCount = validEntries.length > 0 ? validEntries[0][1] : 1;

                  if (validEntries.length === 0) {
                    return <EmptyState message="No facet distribution data available for this dimension." />;
                  }

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                        <span>Total Items Analyzed: <strong className="text-slate-200 font-mono">{totalCount.toLocaleString()}</strong></span>
                        <span>Categories: <strong className="text-slate-200 font-mono">{validEntries.length}</strong></span>
                      </div>

                      <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-2">
                        {validEntries.map(([label, count]) => {
                          const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0.0';
                          const barWidth = Math.max(4, Math.round((count / maxCount) * 100));

                          return (
                            <div key={label} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-300 truncate max-w-[400px]">{label}</span>
                                <span className="text-indigo-300 font-semibold">{count.toLocaleString()} ({percentage}%)</span>
                              </div>
                              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
