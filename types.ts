
export interface Trade {
  id: string;
  date: string; // We will use this to store the "Day" (1-31) or full date string, but UI shows Day
  pair: string;
  direction: 'Long' | 'Short';
  // Removed entryPrice & exitPrice
  rr: number;
  result: 'Win' | 'Loss' | 'BE'; 
  pnlDollar: number;
  pnlPercent: number;
  maxRr?: number; // Highest target hit (informational)
  screenshot?: string;
}

export interface MonthData {
  id: string;
  name: string;
  trades: Trade[];
  note?: string; // Backtesting note
}

export interface Strategy {
  id: string;
  name: string;
  months: MonthData[];
  note?: string; // Strategy note
}

export type ViewState = 
  | { type: 'DASHBOARD' }
  | { type: 'STRATEGY_DETAIL'; strategyId: string }
  | { type: 'MONTH_DETAIL'; strategyId: string; monthId: string };

export type Language = 'en' | 'fa';
export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AppState {
  strategies: Strategy[];
  theme: Theme;
  language: Language;
  hasOnboarded: boolean;
  user: User | null;
  isGuest: boolean;
}
