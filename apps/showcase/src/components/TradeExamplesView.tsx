import { Sparkles, ArrowUpRight, Scale } from 'lucide-react';
import { Card, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';

export function TradeExamplesView() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Intro Banner */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>International Trade Examples Placeholder</span>
          </CardTitle>
          <Badge variant="trade">Scheduled for R3-10E</Badge>
        </CardHeader>
        <p className="text-sm text-slate-300 leading-relaxed">
          This surface is an architectural placeholder for international trade and tariff demonstration workflows.
          Substantive trade policy use cases (including Antidumping &amp; Countervailing Duty determinations, Section 301/232 tariff actions, and Harmonized Tariff Schedule cross-references) will be implemented in checkpoint R3-10E.
        </p>
      </Card>

      {/* Foundation Architecture Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Scale className="w-5 h-5 text-purple-400" />
              <span>Trade Domain Alignment</span>
            </CardTitle>
          </CardHeader>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            FederalRegister.gov publishes critical regulatory notices impacting customs classification, trade remedies, and tariff schedules from key trade agencies including:
          </p>
          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside font-mono">
            <li>International Trade Administration (ITA)</li>
            <li>International Trade Commission (ITC)</li>
            <li>Office of the United States Trade Representative (USTR)</li>
            <li>U.S. Customs and Border Protection (CBP)</li>
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <ArrowUpRight className="w-5 h-5 text-indigo-400" />
              <span>R4 Migration Reference Separation</span>
            </CardTitle>
          </CardHeader>
          <p className="text-xs text-slate-300 leading-relaxed">
            Trade and tariff examples demonstrate the Federal Register SDK capabilities.
            Domain-specific business logic (such as HTS duty compounding, AD/CVD case tracking, or customs entry filing validations) remains in downstream applications (such as Handy-Tariff-Smarty) and is strictly excluded from SDK core.
          </p>
        </Card>
      </div>
    </div>
  );
}
