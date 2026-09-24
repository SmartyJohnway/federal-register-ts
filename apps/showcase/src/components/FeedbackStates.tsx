import { Loader2, AlertCircle, HelpCircle } from 'lucide-react';
import { Card } from './Card';

export function LoadingState({ message = 'Loading Federal Register SDK metadata...' }: { message?: string }) {
  return (
    <Card className="flex flex-col items-center justify-center py-12 text-center">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
      <p className="text-sm text-slate-400 font-medium">{message}</p>
    </Card>
  );
}

export function ErrorState({ message = 'An error occurred while loading data.' }: { message?: string }) {
  return (
    <Card className="border-red-900/50 bg-red-950/20 flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
      <p className="text-sm text-red-300 font-medium">{message}</p>
    </Card>
  );
}

export function EmptyState({ message = 'No operations match the selected filter.' }: { message?: string }) {
  return (
    <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed border-slate-800">
      <HelpCircle className="w-8 h-8 text-slate-500 mb-3" />
      <p className="text-sm text-slate-400 font-medium">{message}</p>
    </Card>
  );
}
