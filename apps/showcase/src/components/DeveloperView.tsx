import { useState, useId } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  RotateCcw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Code2,
  History,
  Trash2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { CANONICAL_OPERATIONS, getOperationById } from '../data/registry';
import { getPresentationOverlay } from '../data/presentationOverlay';
import { isRunnable } from '../lib/executor';
import type { OperationTier } from '../types/registry';

export interface ExecutionHistoryItem {
  id: string;
  operationId: string;
  timestamp: string;
  status: 'success' | 'error';
  elapsedMs: number;
  params: any;
  result?: any;
  errorMessage?: string;
}

interface DeveloperViewProps {
  initialOperationId?: string;
}

export function DeveloperView({ initialOperationId = 'DOC-001' }: DeveloperViewProps) {
  const [selectedOpId, setSelectedOpId] = useState<string>(
    isRunnable(initialOperationId) ? initialOperationId : 'DOC-001'
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [paramInput, setParamInput] = useState<string>(() => {
    const overlay = getPresentationOverlay(selectedOpId);
    return overlay.sampleParams ? JSON.stringify(overlay.sampleParams, null, 2) : '';
  });
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeResult, setActiveResult] = useState<any | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('raw');
  const [history, setHistory] = useState<ExecutionHistoryItem[]>([]);

  const operationSelectId = useId();
  const paramEditorId = useId();

  // All 42 runnable operations
  const runnableOperations = CANONICAL_OPERATIONS.filter((op) => isRunnable(op.id));
  const currentOp = getOperationById(selectedOpId) || runnableOperations[0];
  const overlay = getPresentationOverlay(selectedOpId);

  const handleSelectOperation = (opId: string) => {
    setSelectedOpId(opId);
    const newOverlay = getPresentationOverlay(opId);
    setParamInput(newOverlay.sampleParams ? JSON.stringify(newOverlay.sampleParams, null, 2) : '');
    setJsonError(null);
    setExecutionError(null);
    setActiveResult(null);
    setElapsedTime(null);
  };

  const handleResetSample = () => {
    setParamInput(overlay.sampleParams ? JSON.stringify(overlay.sampleParams, null, 2) : '');
    setJsonError(null);
  };

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('npm install federal-register-ts@1.1.0');
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const generateTsSnippet = () => {
    let parsedParams: any = null;
    if (paramInput.trim() !== '') {
      try {
        parsedParams = JSON.parse(paramInput);
      } catch {
        parsedParams = '// [Invalid JSON in Parameter Editor]';
      }
    }

    const paramStr = parsedParams
      ? typeof parsedParams === 'string'
        ? parsedParams
        : JSON.stringify(parsedParams, null, 2)
      : '';

    return `import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

// ${overlay.title} (#${currentOp.ordinal} ${currentOp.id})
const result = await ${currentOp.path}(${paramStr});

console.log(result);`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateTsSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRun = async () => {
    setJsonError(null);
    setExecutionError(null);

    let parsedParams: any = undefined;
    if (paramInput.trim() !== '') {
      try {
        parsedParams = JSON.parse(paramInput);
      } catch (err: any) {
        setJsonError(`Invalid JSON: ${err.message}`);
        return;
      }
    }

    setIsRunning(true);
    const startTime = performance.now();

    try {
      // Direct POST to Netlify Function gateway endpoint
      const res = await fetch('/.netlify/functions/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operationId: selectedOpId,
          params: parsedParams,
        }),
      });

      const data = await res.json();
      const localElapsed = Math.round(performance.now() - startTime);
      const measuredElapsed = data.elapsedMs ?? localElapsed;

      setElapsedTime(measuredElapsed);

      if (res.ok && data.success !== false) {
        const resultData = data.data ?? data;
        setActiveResult(resultData);

        const historyEntry: ExecutionHistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          operationId: selectedOpId,
          timestamp: new Date().toLocaleTimeString(),
          status: 'success',
          elapsedMs: measuredElapsed,
          params: parsedParams,
          result: resultData,
        };

        setHistory((prev) => [historyEntry, ...prev].slice(0, 20));
      } else {
        const errorMsg = data.message || data.error || 'Execution returned non-200 status';
        setExecutionError(errorMsg);

        const historyEntry: ExecutionHistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          operationId: selectedOpId,
          timestamp: new Date().toLocaleTimeString(),
          status: 'error',
          elapsedMs: measuredElapsed,
          params: parsedParams,
          errorMessage: errorMsg,
        };

        setHistory((prev) => [historyEntry, ...prev].slice(0, 20));
      }
    } catch (err: any) {
      const localElapsed = Math.round(performance.now() - startTime);
      setElapsedTime(localElapsed);
      const errorMsg = err?.message || 'Network or execution error';
      setExecutionError(errorMsg);

      const historyEntry: ExecutionHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        operationId: selectedOpId,
        timestamp: new Date().toLocaleTimeString(),
        status: 'error',
        elapsedMs: localElapsed,
        params: parsedParams,
        errorMessage: errorMsg,
      };

      setHistory((prev) => [historyEntry, ...prev].slice(0, 20));
    } finally {
      setIsRunning(false);
    }
  };

  const handleReplayHistory = (item: ExecutionHistoryItem) => {
    setSelectedOpId(item.operationId);
    setParamInput(item.params ? JSON.stringify(item.params, null, 2) : '');
    setActiveResult(item.result || null);
    setExecutionError(item.errorMessage || null);
    setElapsedTime(item.elapsedMs);
    setJsonError(null);
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
      {/* Quickstart & Installation Header */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span>Developer Workbench &amp; Live SDK Sandbox</span>
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
              {copiedInstall ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Execute any of the <span className="text-emerald-300 font-semibold">42 runnable SDK operations</span> directly
            through the Node.js 24 runtime sandbox with static allowlist dispatch.
          </p>
        </div>
      </Card>

      {/* Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Operation Selection & Parameter Editor */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Code2 className="w-5 h-5 text-cyan-400" />
                <span>Operation Selector &amp; Parameters</span>
              </CardTitle>
              <Badge variant={getTierBadgeVariant(currentOp.tier)}>{currentOp.tier}</Badge>
            </CardHeader>

            <div className="space-y-4">
              {/* Dropdown Selector */}
              <div>
                <label htmlFor={operationSelectId} className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                  Select Operation (42 Runnable)
                </label>
                <select
                  id={operationSelectId}
                  value={selectedOpId}
                  onChange={(e) => handleSelectOperation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {runnableOperations.map((op) => (
                    <option key={op.id} value={op.id}>
                      [{op.id}] {op.path} ({op.tier})
                    </option>
                  ))}
                </select>
              </div>

              {/* Operation Details Badge Row */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-400 font-mono">{currentOp.path}</span>
                  <span className="text-slate-400 font-mono">#{currentOp.ordinal}</span>
                </div>
                <p className="text-slate-300 text-xs">{currentOp.desc}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                  <span className="text-slate-500">paramReq:</span>
                  <span className="text-slate-300">{currentOp.paramReq}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500">returns:</span>
                  <span className="text-indigo-300 truncate max-w-[200px]" title={currentOp.returns}>
                    {currentOp.returns}
                  </span>
                </div>
              </div>

              {/* Parameter Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor={paramEditorId} className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                    JSON Parameters {currentOp.paramReq === 'None' && '(No params required)'}
                  </label>
                  <button
                    onClick={handleResetSample}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Sample</span>
                  </button>
                </div>

                <textarea
                  id={paramEditorId}
                  rows={6}
                  value={paramInput}
                  onChange={(e) => {
                    setParamInput(e.target.value);
                    setJsonError(null);
                  }}
                  placeholder={currentOp.paramReq === 'None' ? 'No parameters needed for this operation.' : '{\n  "conditions": { "term": "example" }\n}'}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-md font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500 selection:bg-cyan-500/30"
                />

                {jsonError && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400 font-mono">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{jsonError}</span>
                  </div>
                )}
              </div>

              {/* Run Action Button */}
              <div className="pt-2 flex items-center justify-between">
                <Button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs py-2.5 shadow-lg shadow-cyan-950/40"
                >
                  <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Executing via Node 24...' : `Run ${currentOp.id}`}</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Generated TypeScript Code Snippet */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Generated TypeScript Code</span>
              </CardTitle>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 text-xs font-mono"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </CardHeader>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
              {generateTsSnippet()}
            </pre>
          </Card>
        </div>

        {/* Right Column: Execution Output & Request History */}
        <div className="lg:col-span-6 space-y-6">
          {/* Execution Result Box */}
          <Card>
            <CardHeader>
              <CardTitle>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Execution Output</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                {elapsedTime !== null && (
                  <Badge variant="outline" className="flex items-center gap-1 text-cyan-300 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{elapsedTime}ms</span>
                  </Badge>
                )}
                <div className="flex rounded bg-slate-900 border border-slate-800 p-0.5 text-[11px] font-mono">
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`px-2 py-0.5 rounded ${viewMode === 'raw' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'}`}
                  >
                    Raw JSON
                  </button>
                  <button
                    onClick={() => setViewMode('formatted')}
                    className={`px-2 py-0.5 rounded ${viewMode === 'formatted' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'}`}
                  >
                    Formatted
                  </button>
                </div>
              </div>
            </CardHeader>

            <div className="space-y-4">
              {executionError ? (
                <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Execution Error ({selectedOpId})</span>
                  </div>
                  <pre className="text-xs font-mono text-rose-300 overflow-x-auto whitespace-pre-wrap">
                    {executionError}
                  </pre>
                </div>
              ) : activeResult ? (
                <div>
                  <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 max-h-[420px] overflow-auto">
                    {JSON.stringify(activeResult, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-lg">
                  Click "Run {currentOp.id}" to execute operation and inspect response data.
                </div>
              )}
            </div>
          </Card>

          {/* Bounded Session Request History */}
          <Card>
            <CardHeader>
              <CardTitle>
                <History className="w-4 h-4 text-purple-400" />
                <span>Session Request History ({history.length}/20)</span>
              </CardTitle>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 font-mono transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </CardHeader>

            {history.length === 0 ? (
              <div className="text-center py-6 text-slate-500 font-mono text-xs">
                No executions recorded in current browser session.
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleReplayHistory(item)}
                    className="p-2.5 rounded bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs font-mono transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      {item.status === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-200 group-hover:text-cyan-400">
                        {item.operationId}
                      </span>
                      <span className="text-slate-500 text-[11px]">{item.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">{item.elapsedMs}ms</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
