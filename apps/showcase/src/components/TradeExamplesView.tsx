import { Sparkles, FileText, ArrowUpRight, Scale, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';

export function TradeExamplesView() {
  const tradeScenarios = [
    {
      title: 'Antidumping & Countervailing Duty (AD/CVD)',
      icon: Scale,
      agency: 'International Trade Administration (ITA) / ITC',
      operations: ['client.documents.search', 'client.documents.find', 'client.agencies.find'],
      description:
        'Query official determinations, preliminary results, and sunset reviews for specific country/commodity pairings with precise term filtering and agency projections.',
      exampleQuery: `{
  conditions: {
    agencies: ['international-trade-administration'],
    term: 'corrosion-resistant steel countervailing duty'
  }
}`,
    },
    {
      title: 'Section 301 / 232 Tariff Actions & Exclusions',
      icon: ShieldAlert,
      agency: 'Office of the United States Trade Representative (USTR)',
      operations: ['client.documents.search', 'client.facets.document.daily'],
      description:
        'Track modification notices, tariff annexes, and product exclusion extensions across presidential proclamations and trade representative dockets.',
      exampleQuery: `{
  conditions: {
    agencies: ['trade-representative-office-of-united-states'],
    term: 'Section 301 China tariff modification'
  }
}`,
    },
    {
      title: 'Harmonized Tariff Schedule (HTS) Cross-References',
      icon: FileText,
      agency: 'U.S. Customs and Border Protection (CBP) / ITC',
      operations: ['client.documents.search', 'client.documents.searchDetails', 'client.topics.suggestions'],
      description:
        'Cross-reference 8-digit and 10-digit HTS codes with regulatory notices for quota allocations, customs classification rulings, and special trade programs.',
      exampleQuery: `{
  conditions: {
    term: 'HTSUS 8541.40 solar cells quota'
  }
}`,
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Intro Banner */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>International Trade &amp; Tariff Use Cases</span>
          </CardTitle>
          <Badge variant="trade">R4 Migration Reference</Badge>
        </CardHeader>
        <p className="text-sm text-slate-300 leading-relaxed">
          FederalRegister.gov publishes critical regulatory actions impacting global supply chains, customs tariffs, and trade remedies.
          The canonical TypeScript SDK provides high-performance, strongly typed access to these notices.
        </p>
      </Card>

      {/* Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tradeScenarios.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <Card key={scenario.title} hoverEffect className="flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {scenario.agency}
                  </Badge>
                </div>

                <h4 className="text-base font-semibold text-white">{scenario.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{scenario.description}</p>

                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">Key Operations Used:</div>
                  <div className="flex flex-wrap gap-1">
                    {scenario.operations.map((op) => (
                      <span
                        key={op}
                        className="text-[10px] font-mono bg-slate-950 text-cyan-400 px-1.5 py-0.5 rounded border border-slate-800"
                      >
                        {op}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-500 mb-1">Sample Search Conditions</div>
                <pre className="text-[11px] font-mono bg-slate-950 p-2 rounded border border-slate-800 text-slate-300 overflow-x-auto">
                  {scenario.exampleQuery}
                </pre>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Boundary Callout */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs text-purple-200 flex items-start gap-3">
        <ArrowUpRight className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-purple-300">R4 Clean Boundary Principle: </span>
          Trade/tariff examples demonstrate Federal Register API capabilities relevant to trade policy.
          Domain-specific tariff calculation logic (such as HTS duty compounding, AD/CVD case tracking, or CBP entry validations) remains in downstream applications and is not embedded into the standalone SDK core.
        </div>
      </div>
    </div>
  );
}
