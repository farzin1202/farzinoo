/*
  # Trading Journal Database Schema

  1. New Tables
    - `strategies` - Trading strategies with name and notes
    - `months` - Monthly backtesting periods for each strategy
    - `trades` - Individual trade records

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Cascade deletes for data integrity
*/

-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Create months table
CREATE TABLE IF NOT EXISTS months (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id uuid REFERENCES strategies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id uuid REFERENCES months(id) ON DELETE CASCADE NOT NULL,
  date text NOT NULL,
  pair text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('Long', 'Short')),
  rr numeric NOT NULL,
  result text NOT NULL CHECK (result IN ('Win', 'Loss', 'BE')),
  pnl_dollar numeric NOT NULL,
  pnl_percent numeric NOT NULL,
  max_rr numeric,
  screenshot text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_months_strategy_id ON months(strategy_id);
CREATE INDEX IF NOT EXISTS idx_trades_month_id ON trades(month_id);

-- Enable Row Level Security
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE months ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Strategies policies
CREATE POLICY "Users can view own strategies"
  ON strategies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategies"
  ON strategies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategies"
  ON strategies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategies"
  ON strategies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Months policies
CREATE POLICY "Users can view own months"
  ON months FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM strategies
      WHERE strategies.id = months.strategy_id
      AND strategies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own months"
  ON months FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM strategies
      WHERE strategies.id = months.strategy_id
      AND strategies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own months"
  ON months FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM strategies
      WHERE strategies.id = months.strategy_id
      AND strategies.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM strategies
      WHERE strategies.id = months.strategy_id
      AND strategies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own months"
  ON months FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM strategies
      WHERE strategies.id = months.strategy_id
      AND strategies.user_id = auth.uid()
    )
  );

-- Trades policies
CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM months
      JOIN strategies ON strategies.id = months.strategy_id
      WHERE months.id = trades.month_id
      AND strategies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM months
      JOIN strategies ON strategies.id = months.strategy_id
      WHERE months.id = trades.month_id
      AND strategies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own trades"
  ON trades FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM months
      JOIN strategies ON strategies.id = months.strategy_id
      WHERE months.id = trades.month_id
      AND strategies.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM months
      JOIN strategies ON strategies.id = months.strategy_id
      WHERE months.id = trades.month_id
      AND strategies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own trades"
  ON trades FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM months
      JOIN strategies ON strategies.id = months.strategy_id
      WHERE months.id = trades.month_id
      AND strategies.user_id = auth.uid()
    )
  );