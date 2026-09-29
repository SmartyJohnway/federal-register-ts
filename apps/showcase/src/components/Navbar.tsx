import { LayoutDashboard, Code, Sparkles, Layers, Terminal } from 'lucide-react';
import { Badge } from './Badge';

export type NavTab = 'explore' | 'developer' | 'trade' | 'capabilities';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export function Navbar({ activeTab, onSelectTab }: NavbarProps) {
  const tabs = [
    { id: 'explore' as NavTab, label: 'Explore', icon: LayoutDashboard },
    { id: 'developer' as NavTab, label: 'Developer', icon: Code },
    { id: 'trade' as NavTab, label: 'Trade Examples', icon: Sparkles },
    { id: 'capabilities' as NavTab, label: 'Capabilities', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-950/40">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-base tracking-tight">federal-register-ts</span>
              <Badge variant="success">v1.1.0</Badge>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Canonical TypeScript SDK Showcase</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
