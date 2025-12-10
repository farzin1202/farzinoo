
import { createClient } from '@supabase/supabase-js';

// NOTE: In a real Next.js/Vite app, these would be process.env.NEXT_PUBLIC_SUPABASE_URL
// For this environment, ensure these are set in the global scope or passed in.
// We provide fallback placeholders to prevent the app from crashing if keys are missing.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials missing. App will default to Guest Mode.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
