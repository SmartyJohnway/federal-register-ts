import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar, NavTab } from './components/Navbar';
import { ExploreView } from './components/ExploreView';
import { DeveloperView } from './components/DeveloperView';
import { TradeExamplesView } from './components/TradeExamplesView';
import { CapabilitiesView } from './components/CapabilitiesView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('explore');
  const [developerOperationId, setDeveloperOperationId] = useState<string>('DOC-001');

  const handleOpenInWorkbench = (operationId: string) => {
    setDeveloperOperationId(operationId);
    setActiveTab('developer');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'explore' && (
            <ExploreView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'developer' && (
            <DeveloperView key={developerOperationId} initialOperationId={developerOperationId} />
          )}
          {activeTab === 'trade' && <TradeExamplesView />}
          {activeTab === 'capabilities' && (
            <CapabilitiesView onOpenInWorkbench={handleOpenInWorkbench} />
          )}
        </main>

        <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span>SmartyJohnway / federal-register-ts SDK Showcase</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Canonical 54 Operations</span>
              <span>•</span>
              <span>14 Namespaces</span>
              <span>•</span>
              <span>Netlify Functions Node 24</span>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
