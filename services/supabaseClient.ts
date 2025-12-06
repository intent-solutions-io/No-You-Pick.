
import { createClient } from '@supabase/supabase-js';

// Use direct strings to prevent 'process is not defined' errors in browser environment
const SUPABASE_URL = 'https://cgypvbhohtbepvzhxbsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneXB2YmhvaHRiZXB2emh4YnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5ODQ5ODAsImV4cCI6MjA4MDU2MDk4MH0.mSZARGU4e9c-6xwzw1LOdrURhGkK2yg7ann3BB8HXJg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
