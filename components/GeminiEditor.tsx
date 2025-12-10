import React, { useState } from 'react';
import { Sparkles, X, BrainCircuit, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { analyzeBacktest } from '../services/gemini';
import { TRANSLATIONS } from '../constants';
import { Language, MonthData } from '../types';

interface AIAnalystProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  monthData: MonthData | null;
  stats: { winRate: number, netPnL: number };
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ isOpen, onClose, lang, monthData, stats }) => {
  const t = TRANSLATIONS[lang];
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !monthData) return null;

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeBacktest(monthData, stats.winRate, stats.netPnL);
      if (result) {
        setAnalysis(result);
      }
    } catch (e) {
      console.error(e);
      setAnalysis("Error connecting to AI Coach. Please check API Key.");
    } finally {
      setLoading(false);
    }
  };

  // Basic markdown parser for display
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('###') || line.startsWith('**')) return <p key={i} className="font-bold text-lg mt-4 text-blue-400">{line.replace(/[#*]/g, '')}</p>;
      if (line.startsWith('-')) return <li key={i} className="ml-4 text-zinc-300 my-1">{line.replace('-', '')}</li>;
      return <p key={i} className="text-zinc-300 my-1">{line}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative bg-[#09090b] text-zinc-100 w-full max-w-4xl rounded-2xl border border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/20">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">AI Performance Coach</h2>
              <p className="text-xs text-zinc-500">Analysis by Gemini 2.5 Flash</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          
          {!analysis && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
               <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20"></div>
                  <Sparkles className="w-20 h-20 text-blue-500 relative z-10" />
               </div>
               <div className="max-w-md space-y-2">
                 <h3 className="text-2xl font-bold">Ready to analyze {monthData.name}?</h3>
                 <p className="text-zinc-400">I will review your {monthData.trades.length} trades, win rate ({stats.winRate}%), and risk management to provide professional coaching advice.</p>
               </div>
               <button 
                 onClick={handleAnalyze}
                 className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all transform hover:-translate-y-1 shadow-lg shadow-white/10 flex items-center gap-2"
               >
                 <Sparkles className="w-4 h-4" /> Start Analysis
               </button>
            </div>
          )}

          {loading && (
             <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-16 h-16 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-zinc-400 animate-pulse">Reviewing your trading journal...</p>
             </div>
          )}

          {analysis && (
            <div className="prose prose-invert max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                 <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500 uppercase font-semibold">Win Rate</p>
                    <p className={`text-2xl font-bold ${stats.winRate >= 50 ? 'text-emerald-400' : 'text-zinc-300'}`}>{stats.winRate}%</p>
                 </div>
                 <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500 uppercase font-semibold">Net PnL</p>
                    <p className={`text-2xl font-bold ${stats.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{stats.netPnL > 0 ? '+' : ''}{stats.netPnL}%</p>
                 </div>
                 <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500 uppercase font-semibold">Trades</p>
                    <p className="text-2xl font-bold text-white">{monthData.trades.length}</p>
                 </div>
              </div>
              
              <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/50 space-y-1">
                 {formatText(analysis)}
              </div>

              <div className="mt-8 flex justify-center">
                 <button onClick={() => setAnalysis(null)} className="text-zinc-500 hover:text-white text-sm">Analyze Again</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};