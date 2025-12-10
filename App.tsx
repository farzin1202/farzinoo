
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, Moon, Globe, ChevronRight, Plus, Trash2, 
  ArrowLeft, Edit2, TrendingUp, TrendingDown,
  LayoutDashboard, Calendar, LineChart, Check, X as XIcon,
  Maximize2, LogOut, User as UserIcon, Settings, ChevronDown,
  Home, Command, Slash, Menu as MenuIcon, LayoutGrid, StickyNote, BrainCircuit
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AppState, Strategy, ViewState, Trade, User, Language, Theme } from './types';
import { TRANSLATIONS, INITIAL_STRATEGIES } from './constants';
import { AIAnalyst } from './components/GeminiEditor';
import { loginWithGoogle, logout, getCurrentUser } from './services/auth';
import { supabase } from './services/supabase';
import * as db from './services/db';

// --- Components ---

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  placeholder: string;
  mode: 'TEXT' | 'DATE';
}

const InputModal: React.FC<InputModalProps> = ({ isOpen, onClose, onSubmit, title, placeholder, mode }) => {
  const [value, setValue] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(MONTH_NAMES[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue("");
      // Reset date defaults
      setSelectedMonth(MONTH_NAMES[new Date().getMonth()]);
      setSelectedYear(new Date().getFullYear());
      
      if (mode === 'TEXT') {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'DATE') {
      onSubmit(`${selectedMonth} ${selectedYear}`);
    } else {
      if (value.trim()) onSubmit(value);
    }
  };

  // Generate years: current year - 2 to current year + 5
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#09090b] text-white w-full max-w-md rounded-2xl border border-zinc-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <form onSubmit={handleSubmit}>
          
          {mode === 'TEXT' ? (
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 mb-6 text-zinc-100 placeholder:text-zinc-600"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium ml-1">Month</label>
                <div className="relative">
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 appearance-none outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-100 cursor-pointer"
                  >
                    {MONTH_NAMES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium ml-1">Year</label>
                 <div className="relative">
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 appearance-none outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-100 cursor-pointer"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg hover:bg-zinc-800 text-zinc-400 font-medium transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={mode === 'TEXT' && !value.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition shadow-lg shadow-blue-900/20"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Onboarding = ({ onComplete, lang }: { onComplete: () => void, lang: 'en' | 'fa' }) => {
  const [step, setStep] = useState(0);
  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] text-white flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-2xl text-center space-y-10 animate-in fade-in duration-1000 slide-in-from-bottom-10">
        {step === 0 ? (
          <>
            <div className="space-y-4">
               <h1 className="text-6xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/40 text-transparent bg-clip-text">
                TradeFlow
              </h1>
              <p className="text-2xl text-zinc-400 font-light max-w-lg mx-auto leading-relaxed">{t.welcome}</p>
            </div>
            
            <button 
              onClick={() => setStep(1)}
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-white px-8 font-medium text-black transition-all duration-300 hover:w-40 hover:bg-zinc-200"
            >
              <span className="mr-2">Next</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </>
        ) : (
          <>
             <div className="flex justify-center mb-8">
               <div className="relative">
                 <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20" />
                 <div className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-3xl text-emerald-400 shadow-2xl">
                    <TrendingUp className="w-12 h-12" />
                 </div>
               </div>
             </div>
            <h2 className="text-4xl font-bold tracking-tight">{t.welcomeSub}</h2>
            <button 
              onClick={onComplete}
              className="mt-8 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-1 w-full md:w-auto"
            >
              {t.getStarted}
            </button>
          </>
        )}
      </div>
      
      <div className="absolute bottom-12 flex gap-3">
        <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 0 ? 'w-8 bg-white' : 'w-2 bg-zinc-800'}`} />
        <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'w-8 bg-white' : 'w-2 bg-zinc-800'}`} />
      </div>
    </div>
  );
};

const LoginPage = ({ onLogin, onGuest, loading, lang }: { onLogin: () => void, onGuest: () => void, loading: boolean, lang: Language }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="fixed inset-0 z-50 bg-[#050505] text-white flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
      
      <div className="relative z-10 w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
          <Command className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight mb-2">{t.loginTitle}</h2>
        <p className="text-zinc-400 mb-10 leading-relaxed">{t.loginSub}</p>

        <button 
          onClick={onLogin}
          disabled={loading}
          className="w-full bg-white text-black h-12 rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-3 mb-4"
        >
          {loading ? (
             <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M12.0003 20.45c-4.6667 0-8.45-3.7834-8.45-8.4501 0-4.6666 3.7833-8.45 8.45-8.45 2.2833 0 4.35 0.8334 5.95 2.2167l-2.4 2.4c-0.9167-0.8833-2.1667-1.4167-3.55-1.4167-2.9 0-5.25 2.35-5.25 5.25s2.35 5.25 5.25 5.25c2.65 0 4.8833-1.8833 5.1833-4.4h-5.1833v-3.2h8.5666c0.0834 0.5 0.1334 1.0167 0.1334 1.5667 0 4.9-3.2666 8.45-8.6999 8.45z" fill="currentColor"></path></svg>
          )}
          {t.loginGoogle}
        </button>

        <button 
          onClick={onGuest}
          className="text-sm text-zinc-500 hover:text-white transition-colors"
        >
          {t.continueGuest}
        </button>
      </div>
    </div>
  );
};

// --- User Menu Component ---

interface UserMenuProps {
  user: User | null;
  lang: Language;
  theme: Theme;
  onLogout: () => void;
  onLogin: () => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  onLogoutClick: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, lang, theme, onLogoutClick, onLogin, onToggleTheme, onToggleLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 bg-[var(--card)] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-200 shadow-sm"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full bg-zinc-200" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        )}
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
        <MenuIcon className="w-4 h-4 text-zinc-500 group-hover:text-foreground transition-colors" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
           <div className="p-3 border-b border-[var(--border)] bg-zinc-50/50 dark:bg-zinc-900/50">
              <p className="text-sm font-bold text-foreground">{user ? user.name : t.guest}</p>
              <p className="text-xs text-zinc-500 truncate">{user ? user.email : 'No account connected'}</p>
           </div>
           
           <div className="p-2 space-y-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {t.settings}
              </div>
              
              <button onClick={onToggleTheme} className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                 <div className="flex items-center gap-2">
                   {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                   <span>{t.theme}</span>
                 </div>
                 <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-[var(--border)]">{theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>

              <button onClick={onToggleLang} className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                 <div className="flex items-center gap-2">
                   <Globe className="w-4 h-4" />
                   <span>{t.language}</span>
                 </div>
                 <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-[var(--border)]">{lang === 'en' ? 'EN' : 'FA'}</span>
              </button>
           </div>
           
           <div className="p-2 border-t border-[var(--border)]">
              {user ? (
                <button 
                  onClick={onLogoutClick}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.logout}</span>
                </button>
              ) : (
                <button 
                  onClick={onLogin}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{t.signIn}</span>
                </button>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

// --- Breadcrumbs Component ---

interface BreadcrumbsProps {
  view: ViewState;
  strategies: Strategy[];
  onNavigate: (view: ViewState) => void;
  lang: Language;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ view, strategies, onNavigate, lang }) => {
  
  // Base Item
  const items = [
    { 
      label: 'Home', 
      onClick: () => onNavigate({ type: 'DASHBOARD' }), 
      icon: <LayoutGrid className="w-4 h-4" />,
      isRoot: true 
    }
  ];

  if (view.type !== 'DASHBOARD') {
    const strategy = strategies.find(s => s.id === view.strategyId);
    if (strategy) {
      // Add Strategy Level
      items.push({ 
        label: strategy.name, 
        onClick: () => onNavigate({ type: 'STRATEGY_DETAIL', strategyId: strategy.id }),
        icon: null,
        isRoot: false
      });

      if (view.type === 'MONTH_DETAIL') {
        const month = strategy.months.find(m => m.id === view.monthId);
        if (month) {
          // Add Month Level (Current Page)
          items.push({ 
            label: month.name, 
            onClick: () => {}, 
            icon: null,
            isRoot: false
          });
        }
      }
    }
  }

  return (
    <nav className="flex items-center text-sm font-medium">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center">
            {index > 0 && <Slash className="w-3 h-3 text-zinc-300 dark:text-zinc-700 mx-2 -rotate-12" />}
            <button 
              onClick={item.onClick}
              disabled={isLast}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                isLast 
                  ? 'text-foreground font-semibold cursor-default' 
                  : 'text-zinc-500 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title={item.label}
            >
              {item.icon}
              {!item.isRoot && <span>{item.label}</span>}
            </button>
          </div>
        );
      })}
    </nav>
  );
};

// --- Main App ---

export default function App() {
  // State
  const [state, setState] = useState<AppState>(() => {
    // Initial load from local storage only for preferences/guest
    const saved = localStorage.getItem('tradeflow_state');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      strategies: [], // Start empty, fetch from DB
      theme: parsed.theme || 'dark',
      language: parsed.language || 'en',
      hasOnboarded: parsed.hasOnboarded || false,
      user: null, // Start null, check auth
      isGuest: false
    };
  });

  const [view, setView] = useState<ViewState>({ type: 'DASHBOARD' });
  const [isAnalystOpen, setIsAnalystOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'STRATEGY' | 'MONTH' | null;
    strategyId?: string;
  }>({ isOpen: false, type: null });

  // Persistence for preferences only
  useEffect(() => {
    const preferences = {
      theme: state.theme,
      language: state.language,
      hasOnboarded: state.hasOnboarded
    };
    localStorage.setItem('tradeflow_state', JSON.stringify(preferences));
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    document.documentElement.dir = state.language === 'fa' ? 'rtl' : 'ltr';
  }, [state.theme, state.language, state.hasOnboarded]);

  // Auth & Data Listener
  useEffect(() => {
    const init = async () => {
      setIsLoadingData(true);
      
      // Safety Check: If no Supabase config (empty or placeholder check), force Guest Mode
      // This prevents the app from trying to connect to a non-existent DB
      const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0;
      
      if (!hasSupabase) {
          console.warn("Supabase credentials missing. Defaulting to Guest Mode with mock data.");
          setState(s => ({ ...s, isGuest: true, strategies: INITIAL_STRATEGIES as any }));
          setIsLoadingData(false);
          return;
      }

      // Check current session
      const user = await getCurrentUser();
      if (user) {
        setState(s => ({ ...s, user, isGuest: false }));
        // Fetch DB Data
        try {
          const strategies = await db.fetchFullData();
          setState(s => ({ ...s, strategies }));
        } catch (e) {
          console.error("Failed to load data", e);
        }
      }

      setIsLoadingData(false);

      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const u = await getCurrentUser();
          setState(s => ({ ...s, user: u, isGuest: false }));
          const strategies = await db.fetchFullData();
          setState(s => ({ ...s, strategies }));
        } else if (event === 'SIGNED_OUT') {
           setState(s => ({ ...s, user: null, strategies: [] }));
        }
      });

      return () => subscription.unsubscribe();
    };

    init();
  }, []);

  const t = TRANSLATIONS[state.language];

  // Handlers
  const toggleTheme = () => setState(s => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' }));
  const toggleLang = () => setState(s => ({ ...s, language: s.language === 'en' ? 'fa' : 'en' }));
  const completeOnboarding = () => setState(s => ({ ...s, hasOnboarded: true }));
  const continueAsGuest = () => {
     // Guest gets mock data
     setState(s => ({ ...s, isGuest: true, strategies: INITIAL_STRATEGIES as any }));
  };

  // Auth Handlers
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
      // Redirect happens, no code here
    } catch (error) {
      console.error(error);
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Modal Handlers
  const openAddStrategy = () => setModalConfig({ isOpen: true, type: 'STRATEGY' });
  const openAddMonth = (strategyId: string) => setModalConfig({ isOpen: true, type: 'MONTH', strategyId });
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  const handleModalSubmit = async (value: string) => {
    if (state.isGuest) {
        // Guest mode - local state only
        if (modalConfig.type === 'STRATEGY') {
          setState(s => ({ ...s, strategies: [...s.strategies, { id: Date.now().toString(), name: value, months: [] }] }));
        } else if (modalConfig.type === 'MONTH' && modalConfig.strategyId) {
          setState(s => ({ ...s, strategies: s.strategies.map(st => st.id === modalConfig.strategyId ? { ...st, months: [...st.months, { id: Date.now().toString(), name: value, trades: [] }] } : st) }));
        }
    } else if (state.user) {
        // DB Mode
        try {
           if (modalConfig.type === 'STRATEGY') {
              const newStrat = await db.createStrategy(state.user.id, value);
              setState(s => ({ ...s, strategies: [...s.strategies, newStrat] }));
           } else if (modalConfig.type === 'MONTH' && modalConfig.strategyId) {
              const newMonth = await db.createMonth(modalConfig.strategyId, value);
              setState(s => ({
                  ...s,
                  strategies: s.strategies.map(st => st.id === modalConfig.strategyId ? {
                      ...st, months: [...st.months, newMonth]
                  } : st)
              }));
           }
        } catch (e) {
            console.error(e);
            alert("Error saving data");
        }
    }
    closeModal();
  };

  const deleteStrategy = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure?")) return;
    
    if (!state.isGuest) await db.deleteStrategy(id);
    setState(s => ({ ...s, strategies: s.strategies.filter(st => st.id !== id) }));
  };

  const updateStrategyNote = async (id: string, note: string) => {
    if (!state.isGuest) await db.updateStrategyNote(id, note);
    setState(s => ({
      ...s,
      strategies: s.strategies.map(st => st.id === id ? { ...st, note } : st)
    }));
  };

  const updateMonthNote = async (strategyId: string, monthId: string, note: string) => {
    if (!state.isGuest) await db.updateMonthNote(monthId, note);
    setState(s => ({
      ...s,
      strategies: s.strategies.map(st => st.id !== strategyId ? st : {
        ...st,
        months: st.months.map(m => m.id === monthId ? { ...m, note } : m)
      })
    }));
  };

  const addTrade = async (strategyId: string, monthId: string) => {
    const activeStrategy = state.strategies.find(s => s.id === strategyId);
    const activeMonth = activeStrategy?.months.find(m => m.id === monthId);
    if (!activeMonth) return;

    const defaultPair = activeMonth.trades.length > 0 ? activeMonth.trades[0].pair : 'EURUSD';
    const newTradeData: Partial<Trade> = {
      date: '1',
      pair: defaultPair,
      direction: 'Long',
      rr: 2,
      result: 'BE',
      pnlDollar: 0,
      pnlPercent: 0,
      maxRr: 0
    };

    if (state.isGuest) {
        const t: Trade = { id: Date.now().toString(), ...newTradeData } as Trade;
        updateLocalTrades(strategyId, monthId, [...activeMonth.trades, t]);
    } else {
        try {
            const createdTrade = await db.createTrade(monthId, newTradeData);
            updateLocalTrades(strategyId, monthId, [...activeMonth.trades, createdTrade]);
        } catch (e) { console.error(e); }
    }
  };

  const updateTrade = async (strategyId: string, monthId: string, tradeId: string, field: keyof Trade, value: any) => {
    const activeStrategy = state.strategies.find(s => s.id === strategyId);
    const activeMonth = activeStrategy?.months.find(m => m.id === monthId);
    if (!activeMonth) return;

    const oldTrade = activeMonth.trades.find(t => t.id === tradeId);
    if (!oldTrade) return;

    let updatedTrade = { ...oldTrade, [field]: value };

    // Auto-calculate PnL%
    if (field === 'result' || field === 'rr') {
        const rr = field === 'rr' ? (value as number) : updatedTrade.rr;
        const res = field === 'result' ? (value as string) : updatedTrade.result;
        
        if (res === 'Win') {
            updatedTrade.pnlPercent = rr;
            if (updatedTrade.pnlDollar < 0) updatedTrade.pnlDollar = Math.abs(updatedTrade.pnlDollar);
        } else if (res === 'Loss') {
            updatedTrade.pnlPercent = -1;
            if (updatedTrade.pnlDollar > 0) updatedTrade.pnlDollar = -Math.abs(updatedTrade.pnlDollar);
        } else {
            updatedTrade.pnlPercent = 0;
            updatedTrade.pnlDollar = 0;
        }
    }

    if (!state.isGuest) {
        // Optimistic update locally? No, let's fire and forget for UI responsiveness but we need to persist
        // We will update local state immediately
        // And send async DB request
        db.updateTrade(tradeId, { 
            [field]: value, 
            pnlPercent: updatedTrade.pnlPercent, 
            pnlDollar: updatedTrade.pnlDollar 
        });
    }
    
    const updatedTrades = activeMonth.trades.map(tr => tr.id === tradeId ? updatedTrade : tr);
    updateLocalTrades(strategyId, monthId, updatedTrades);
  };

  const deleteTrade = async (strategyId: string, monthId: string, tradeId: string) => {
    const activeStrategy = state.strategies.find(s => s.id === strategyId);
    const activeMonth = activeStrategy?.months.find(m => m.id === monthId);
    if (!activeMonth) return;
    
    if (!state.isGuest) await db.deleteTrade(tradeId);
    
    const updatedTrades = activeMonth.trades.filter(tr => tr.id !== tradeId);
    updateLocalTrades(strategyId, monthId, updatedTrades);
  }

  // Helper to update state tree deeply
  const updateLocalTrades = (strategyId: string, monthId: string, trades: Trade[]) => {
    setState(s => ({
      ...s,
      strategies: s.strategies.map(st => st.id !== strategyId ? st : {
        ...st,
        months: st.months.map(m => m.id !== monthId ? m : { ...m, trades })
      })
    }));
  };

  // --- Render Flow ---

  if (isLoadingData) {
      return (
          <div className="fixed inset-0 bg-[#09090b] text-white flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500 animate-pulse">Syncing with database...</p>
          </div>
      );
  }

  if (!state.hasOnboarded) {
    return <Onboarding onComplete={completeOnboarding} lang={state.language} />;
  }

  if (!state.user && !state.isGuest) {
    return <LoginPage onLogin={handleLogin} onGuest={continueAsGuest} loading={isLoggingIn} lang={state.language} />;
  }

  const activeStrategy = view.type !== 'DASHBOARD' ? state.strategies.find(s => s.id === view.strategyId) : null;
  const activeMonth = (view.type === 'MONTH_DETAIL' && activeStrategy) ? activeStrategy.months.find(m => m.id === view.monthId) : null;

  // Stats Logic
  const stats = activeMonth ? (() => {
    const wins = activeMonth.trades.filter(t => t.result === 'Win').length;
    const total = activeMonth.trades.length;
    const winRate = total ? Math.round((wins / total) * 100) : 0;
    const netPnL = activeMonth.trades.reduce((acc, t) => acc + (Number(t.pnlPercent) || 0), 0);
    const equityData = activeMonth.trades.map((t, i) => ({
      index: i + 1,
      equity: activeMonth.trades.slice(0, i + 1).reduce((acc, curr) => acc + (Number(curr.pnlPercent) || 0), 0)
    }));
    if (equityData.length === 0) equityData.push({ index: 0, equity: 0});
    else equityData.unshift({ index: 0, equity: 0 });

    return { winRate, netPnL, equityData };
  })() : { winRate: 0, netPnL: 0, equityData: [] };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-blue-500/30">
      
      <AIAnalyst 
        isOpen={isAnalystOpen} 
        onClose={() => setIsAnalystOpen(false)} 
        lang={state.language}
        monthData={activeMonth}
        stats={stats}
      />
      
      <InputModal 
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        title={modalConfig.type === 'STRATEGY' ? t.addStrategy : t.addMonth}
        placeholder={modalConfig.type === 'STRATEGY' ? "e.g., ICT Silver Bullet" : ""}
        mode={modalConfig.type === 'MONTH' ? 'DATE' : 'TEXT'}
      />

      {/* Glass Navbar */}
      <nav className="fixed top-0 inset-x-0 h-16 glass z-40 flex items-center border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center">
             <Breadcrumbs 
               view={view} 
               strategies={state.strategies} 
               onNavigate={setView}
               lang={state.language}
             />
          </div>
          <div className="flex items-center gap-2">
            <UserMenu 
              user={state.user}
              lang={state.language}
              theme={state.theme}
              onLogoutClick={handleLogout}
              onLogin={() => {
                setState(s => ({...s, isGuest: false}));
              }}
              onToggleTheme={toggleTheme}
              onToggleLang={toggleLang}
            />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-6 pt-24 md:pt-36 pb-12 min-h-screen">
        
        {/* VIEW: DASHBOARD */}
        {view.type === 'DASHBOARD' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--border)] pb-4 gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{t.strategies}</h2>
                <p className="text-zinc-500 mt-1">Manage your trading portfolios</p>
              </div>
              <button 
                onClick={openAddStrategy}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm shadow-lg shadow-blue-500/20 transition flex items-center gap-2 self-start md:self-auto"
              >
                <Plus className="w-4 h-4" /> {t.addStrategy}
              </button>
            </div>

            {state.strategies.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--card)]/50">
                 <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-4">
                    <LayoutDashboard className="w-8 h-8 text-zinc-400" />
                 </div>
                 <p className="text-zinc-500 text-lg font-medium">{t.noStrategies}</p>
                 <button onClick={openAddStrategy} className="mt-4 text-blue-500 hover:underline">Create your first strategy</button>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.strategies.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => setView({ type: 'STRATEGY_DETAIL', strategyId: s.id })}
                    className="group relative bg-[var(--card)] border border-[var(--border)] p-6 rounded-2xl hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg"
                  >
                     <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                          <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <button 
                          onClick={(e) => deleteStrategy(s.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                     <h3 className="text-xl font-bold mb-1 tracking-tight">{s.name}</h3>
                     <p className="text-sm text-zinc-500 flex items-center gap-2">
                       <Calendar className="w-4 h-4" />
                       {s.months.length} {t.months} active
                     </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: STRATEGY DETAIL */}
        {view.type === 'STRATEGY_DETAIL' && activeStrategy && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
             <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--border)] pb-4 gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{activeStrategy.name}</h2>
                <p className="text-zinc-500 mt-1">Monthly performance breakdown</p>
              </div>
              <button 
                onClick={() => openAddMonth(activeStrategy.id)}
                className="bg-foreground text-background px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition flex items-center gap-2 self-start md:self-auto"
              >
                <Plus className="w-4 h-4" /> {t.addMonth}
              </button>
            </div>

            {/* Strategy Note */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
               <div className="flex items-center gap-2 mb-2 text-zinc-500">
                 <StickyNote className="w-4 h-4" />
                 <span className="text-xs font-semibold uppercase tracking-wider">{t.notes}</span>
               </div>
               <textarea 
                 value={activeStrategy.note || ''}
                 onChange={(e) => updateStrategyNote(activeStrategy.id, e.target.value)}
                 placeholder={t.notesPlaceholder}
                 className="w-full bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-zinc-500 min-h-[60px]"
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeStrategy.months.map(m => {
                 const winCount = m.trades.filter(x => x.result === 'Win').length;
                 const wr = m.trades.length ? Math.round((winCount/m.trades.length)*100) : 0;
                 return (
                  <div 
                    key={m.id}
                    onClick={() => setView({ type: 'MONTH_DETAIL', strategyId: activeStrategy.id, monthId: m.id })}
                    className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer transition-all hover:-translate-y-1 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-8">
                      <span className="font-semibold text-lg tracking-tight">{m.name}</span>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="flex items-end justify-between">
                       <div>
                         <p className="text-xs text-zinc-500 uppercase font-semibold">Trades</p>
                         <p className="text-xl font-medium">{m.trades.length}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-xs text-zinc-500 uppercase font-semibold">Win Rate</p>
                         <p className={`text-xl font-medium ${wr >= 50 ? 'text-emerald-500' : 'text-zinc-500'}`}>{wr}%</p>
                       </div>
                    </div>
                    <div className="mt-4 w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${wr >= 50 ? 'bg-emerald-500' : 'bg-zinc-500'}`} 
                        style={{ width: `${wr}%` }}
                      />
                    </div>
                  </div>
                 )
              })}
              {activeStrategy.months.length === 0 && (
                <div onClick={() => openAddMonth(activeStrategy.id)} className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-[var(--border)] rounded-xl text-zinc-500 cursor-pointer hover:bg-[var(--card)] transition">
                   <Calendar className="w-10 h-10 mb-2 opacity-50" />
                   <p>No months added yet. Click to add.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: MONTH DETAIL (MODERN WORKSPACE) */}
        {view.type === 'MONTH_DETAIL' && activeMonth && (
           <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              
              {/* TOP SECTION: CHART & STATS */}
              <div className="flex flex-col lg:flex-row gap-6 shrink-0 lg:h-[450px]">
                  {/* Chart Area */}
                  <div className="flex-1 bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 relative overflow-hidden flex flex-col shadow-sm h-[300px] lg:h-auto">
                      <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <LineChart className="w-4 h-4" /> {t.equityCurve}
                        </h3>
                      </div>
                      <div className="flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={stats.equityData}>
                                  <defs>
                                      <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                  <XAxis dataKey="index" hide />
                                  <YAxis 
                                      stroke="#71717a" 
                                      fontSize={12} 
                                      tickFormatter={(val) => `${val > 0 ? '+' : ''}${val}%`}
                                      axisLine={false}
                                      tickLine={false}
                                      width={40}
                                  />
                                  <Tooltip 
                                      contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--foreground)' }}
                                      itemStyle={{ color: 'var(--foreground)' }}
                                  />
                                  <Area 
                                      type="monotone" 
                                      dataKey="equity" 
                                      stroke="#3b82f6" 
                                      strokeWidth={3} 
                                      fillOpacity={1} 
                                      fill="url(#colorEquity)" 
                                      animationDuration={1500}
                                  />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* Stats Sidebar */}
                  <div className="w-full lg:w-[280px] flex flex-col gap-4 shrink-0">
                      {/* Win Rate */}
                      <div className="flex-1 bg-[var(--card)] p-5 rounded-xl border border-[var(--border)] shadow-sm flex flex-col justify-center relative overflow-hidden group min-h-[120px]">
                           <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                              <TrendingUp className="w-16 h-16" />
                           </div>
                           <p className="text-xs text-zinc-500 uppercase font-semibold mb-2">{t.winRate}</p>
                           <div className="text-4xl font-bold tracking-tight">{stats.winRate}%</div>
                           <p className="text-xs text-zinc-500 mt-2">{activeMonth.trades.length} Total Trades</p>
                      </div>

                      {/* PnL */}
                      <div className="flex-1 bg-[var(--card)] p-5 rounded-xl border border-[var(--border)] shadow-sm flex flex-col justify-center relative overflow-hidden min-h-[120px]">
                           <div className="absolute top-0 right-0 p-3 opacity-5">
                              <TrendingDown className="w-16 h-16" />
                           </div>
                           <p className="text-xs text-zinc-500 uppercase font-semibold mb-2">{t.netProfit}</p>
                           <div className={`text-4xl font-bold tracking-tight ${stats.netPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {stats.netPnL > 0 ? '+' : ''}{stats.netPnL}%
                           </div>
                           <p className="text-xs text-zinc-500 mt-2">Net Return for {activeMonth.name}</p>
                      </div>

                      {/* Notes Box */}
                      <div className="flex-1 bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex flex-col min-h-[120px]">
                         <div className="flex items-center gap-2 mb-2 text-zinc-500">
                           <StickyNote className="w-4 h-4" />
                           <span className="text-xs font-semibold uppercase tracking-wider">{t.notes}</span>
                         </div>
                         <textarea 
                           value={activeMonth.note || ''}
                           onChange={(e) => updateMonthNote(activeStrategy!.id, activeMonth.id, e.target.value)}
                           placeholder="Type backtest notes..."
                           className="w-full h-full bg-transparent resize-none outline-none text-xs text-foreground placeholder:text-zinc-500"
                         />
                      </div>
                  </div>
              </div>

               {/* AI Editor Button Section */}
               <div className="flex justify-end">
                   <button 
                      onClick={() => setIsAnalystOpen(true)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 group"
                    >
                      <BrainCircuit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{t.aiEditor}</span>
                    </button>
               </div>

              {/* BOTTOM SECTION: LOG (Redesigned) */}
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm flex flex-col overflow-visible mb-10">
                  <div className="flex items-center justify-between p-2 px-4 border-b border-[var(--border)] bg-zinc-50/30 dark:bg-zinc-900/80 backdrop-blur-md sticky top-16 z-20 rounded-t-xl">
                       <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                              <LayoutDashboard className="w-4 h-4" />
                              Trades Log
                          </span>
                       </div>
                       <button 
                          onClick={() => addTrade(activeStrategy!.id, activeMonth.id)}
                          className="text-xs bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-3 py-1.5 rounded-lg font-medium transition shadow-sm flex items-center gap-1.5 hover:opacity-90"
                      >
                          <Plus className="w-3.5 h-3.5" /> Add Trade
                      </button>
                  </div>

                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm font-mono border-collapse min-w-[800px]">
                          <thead className="bg-[var(--card)] border-b border-[var(--border)] text-zinc-500 font-sans font-medium text-xs uppercase">
                              <tr>
                                  <th className="p-3 pl-4 font-semibold w-[60px]">{t.date}</th>
                                  <th className="p-3 font-semibold w-[100px]">{t.pair}</th>
                                  <th className="p-3 font-semibold w-[90px]">{t.dir}</th>
                                  <th className="p-3 font-semibold text-center w-[80px]">{t.rr}</th>
                                  <th className="p-3 font-semibold text-center w-[120px]">{t.result}</th>
                                  <th className="p-3 font-semibold text-right">{t.pnlD}</th>
                                  <th className="p-3 font-semibold text-right">{t.pnlP}</th>
                                  <th className="p-3 font-semibold text-center text-indigo-400">{t.maxRr}</th>
                                  <th className="p-3 w-[40px]"></th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)]">
                              {activeMonth.trades.map((tr) => (
                                  <tr key={tr.id} className="group hover:bg-zinc-5 dark:hover:bg-white/[0.02] transition-colors">
                                      <td className="p-2 pl-4">
                                         <input 
                                           type="number"
                                           min="1" max="31"
                                           value={tr.date} 
                                           onChange={(e) => updateTrade(activeStrategy!.id, activeMonth.id, tr.id, 'date', e.target.value)}
                                           className="bg-transparent w-full outline-none text-zinc-400 group-hover:text-zinc-200 transition-colors cursor-pointer text-center font-bold" 
                                           placeholder="DD"
                                         />
                                      </td>
                                      <td className="p-2">
                                         <input 
                                           value={tr.pair} 
                                           onChange={(e) => updateTrade(activeStrategy!.id, activeMonth.id, tr.id, 'pair', e.target.value)}
                                           className="bg-transparent w-full outline-none font-bold uppercase tracking-tight text-foreground" 
                                         />
                                      </td>
                                      <td className="p-2">
                                         <select 
                                           value={tr.direction}
                                           onChange={(e) => updateTrade(activeStrategy!.id, activeMonth.id, tr.id, 'direction', e.target.value)}
                                           className={`bg-transparent outline-none cursor-pointer font-bold ${tr.direction === 'Long' ? 'text-emerald-500' : 'text-rose-500'}`}
                                         >
                                           <option value="Long">LONG</option>
                                           <option value="Short">SHRT</option>
                                         </select>
                                      </td>
                                      <td className="p-2 text-center">
                                         <input 
                                           type="number" 
                                           value={tr.rr} 
                                           onChange={(e) => updateTrade(activeStrategy!.id, activeMonth.id, tr.id, 'rr', parseFloat(e.target.value))}
                                           className="bg-transparent w-full outline-none text-center text-zinc-500 focus:text-blue-500 transition-colors" 
                                         />
                                      </td>
                                      <td className="p-2 text-center">
                                         <select 
                                            value={tr.result}
                                            onChange={(e) => updateTrade(activeStrategy!.id, activeMonth.id, tr.id, 'result', e.target.value)}
                                            className={`bg-transparent outline-none cursor-pointer font-bold uppercase tracking-wider text-center w-full appearance-none ${
                                              tr.result === 'Win' ? 'text-emerald-400' : 
                                              tr.result === 'Loss' ? 'text-rose-400' : 
                                              'text-zinc-500'
                                            }`}
                                         >
                                            <option value="Win" className="bg-zinc-900 text-emerald-400">WIN</option>
                                            <option value="Loss" className="bg-zinc-900 text-rose-400">LOSS</option>
                                            <option value="BE" className="bg-zinc-900 text-zinc-400">BE</option>
                                         </select>
                                      </td>
                                      <td className="p-2 text-right">
                                         <input 
                                           type="number" 
                                           value={tr.pnlDollar} 
                                           onChange={(e) => updateTrade(activeStrategy!.id, activeMonth.id, tr.id, 'pnlDollar', parseFloat(e.target.value))}
                                           className={`bg-transparent w-full outline-none text-right font-bold text-lg ${tr.result === 'Win' ? 'text-emerald-500' : tr.result === 'Loss' ? 'text-rose-500' : 'text-zinc-500'}`} 
                                         />
                                      </td>
                                      <td className="p-2 text-right">
                                         <div className={`font-bold text-lg px-2 ${tr.result === 'Win' ? 'text-emerald-500' : tr.result === 'Loss' ? 'text-rose-500' : 'text-zinc-500'}`}>
                                           {tr.pnlPercent > 0 ? '+' : ''}{tr.pnlPercent}%
                                         </div>
                                      </td>
                                      <td className="p-2 text-center relative">
                                        <div className="relative group/input">
                                           <input 
                                            type="number"
                                            value={tr.maxRr || ''}
                                            onChange={(e) => updateTrade(activeStrategy!.id, activeMonth.id, tr.id, 'maxRr', parseFloat(e.target.value))}
                                            placeholder="0"
                                            className="bg-transparent w-full outline-none text-center text-indigo-400 placeholder:text-zinc-800 font-medium py-1 px-2 rounded hover:bg-zinc-800/50 transition-colors"
                                          />
                                          {(!tr.maxRr && tr.maxRr !== 0) && (
                                            <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-800 text-[10px]">
                                              ---
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="p-2 text-center">
                                        <button 
                                          onClick={() => deleteTrade(activeStrategy!.id, activeMonth.id, tr.id)}
                                          className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-500 transition-all rounded hover:bg-red-500/10"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </td>
                                  </tr>
                              ))}
                              {activeMonth.trades.length === 0 && (
                                <tr>
                                  <td colSpan={9} className="p-12 text-center text-zinc-500 font-sans">
                                     <div className="flex flex-col items-center">
                                       <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-3">
                                          <LayoutDashboard className="w-5 h-5 opacity-40" />
                                       </div>
                                       <p className="text-sm">No trades logged yet.</p>
                                       <button onClick={() => addTrade(activeStrategy!.id, activeMonth.id)} className="text-xs text-blue-500 hover:text-blue-400 mt-2 font-medium">Add your first trade</button>
                                     </div>
                                  </td>
                                </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
}
