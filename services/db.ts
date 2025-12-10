import { supabase } from './supabase';
import { Strategy, MonthData, Trade } from '../types';

// --- Type Mapping ---

// The DB returns snake_case, we need camelCase for the UI
const mapTradeFromDB = (t: any): Trade => ({
  id: t.id,
  date: t.date,
  pair: t.pair,
  direction: t.direction,
  rr: Number(t.rr),
  result: t.result,
  pnlDollar: Number(t.pnl_dollar),
  pnlPercent: Number(t.pnl_percent),
  maxRr: t.max_rr ? Number(t.max_rr) : undefined,
  screenshot: t.screenshot,
});

const mapMonthFromDB = (m: any): MonthData => ({
  id: m.id,
  name: m.name,
  note: m.note,
  trades: m.trades ? m.trades.map(mapTradeFromDB) : [], // Expecting joined query
});

const mapStrategyFromDB = (s: any): Strategy => ({
  id: s.id,
  name: s.name,
  note: s.note,
  months: s.months ? s.months.map(mapMonthFromDB) : [],
});

// --- API ---

export const fetchFullData = async () => {
  // Deep nested select
  const { data, error } = await supabase
    .from('strategies')
    .select(`
      *,
      months (
        *,
        trades (*)
      )
    `)
    .order('created_at', { ascending: true }); // Strategy order
    // Note: Ordering nested data in Supabase JS is tricky in one query. 
    // Usually we sort in JS or use separate queries. We'll sort in JS for now.

  if (error) throw error;

  // Client-side sort for nested children
  const strategies = data.map(mapStrategyFromDB);
  
  // Sort months by date-ish (if we strictly parsed names) or just creation
  // Let's assume creation order from DB default, or sort by Name if preferred.
  // We'll leave as is for now.
  
  return strategies;
};

// --- Strategies ---

export const createStrategy = async (userId: string, name: string): Promise<Strategy> => {
  const { data, error } = await supabase
    .from('strategies')
    .insert({ user_id: userId, name })
    .select()
    .single();

  if (error) throw error;
  return { ...mapStrategyFromDB(data), months: [] };
};

export const deleteStrategy = async (id: string) => {
  const { error } = await supabase.from('strategies').delete().eq('id', id);
  if (error) throw error;
};

export const updateStrategyNote = async (id: string, note: string) => {
  const { error } = await supabase.from('strategies').update({ note }).eq('id', id);
  if (error) throw error;
};

// --- Months ---

export const createMonth = async (strategyId: string, name: string): Promise<MonthData> => {
  const { data, error } = await supabase
    .from('months')
    .insert({ strategy_id: strategyId, name })
    .select()
    .single();

  if (error) throw error;
  return { ...mapMonthFromDB(data), trades: [] };
};

export const updateMonthNote = async (id: string, note: string) => {
  const { error } = await supabase.from('months').update({ note }).eq('id', id);
  if (error) throw error;
};

// --- Trades ---

export const createTrade = async (monthId: string, trade: Partial<Trade>): Promise<Trade> => {
  // Convert to DB format
  const dbTrade = {
    month_id: monthId,
    date: trade.date,
    pair: trade.pair,
    direction: trade.direction,
    rr: trade.rr,
    result: trade.result,
    pnl_dollar: trade.pnlDollar,
    pnl_percent: trade.pnlPercent,
    max_rr: trade.maxRr || null,
  };

  const { data, error } = await supabase
    .from('trades')
    .insert(dbTrade)
    .select()
    .single();

  if (error) throw error;
  return mapTradeFromDB(data);
};

export const updateTrade = async (tradeId: string, updates: Partial<Trade>) => {
  // Map updates to snake_case
  const dbUpdates: any = {};
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.pair !== undefined) dbUpdates.pair = updates.pair;
  if (updates.direction !== undefined) dbUpdates.direction = updates.direction;
  if (updates.rr !== undefined) dbUpdates.rr = updates.rr;
  if (updates.result !== undefined) dbUpdates.result = updates.result;
  if (updates.pnlDollar !== undefined) dbUpdates.pnl_dollar = updates.pnlDollar;
  if (updates.pnlPercent !== undefined) dbUpdates.pnl_percent = updates.pnlPercent;
  if (updates.maxRr !== undefined) dbUpdates.max_rr = updates.maxRr;

  const { error } = await supabase.from('trades').update(dbUpdates).eq('id', tradeId);
  if (error) throw error;
};

export const deleteTrade = async (tradeId: string) => {
  const { error } = await supabase.from('trades').delete().eq('id', tradeId);
  if (error) throw error;
};
