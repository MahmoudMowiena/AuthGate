// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pqvvtmvqzwsewlhbgdzr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxdnZ0bXZxendzZXdsaGJnZHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgyMTIxNjQsImV4cCI6MjAzMzc4ODE2NH0.jvdWxDzzzvoWfQ3pFqFLYmugrcQUcQEd2MVQ9eJQmpo';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be set in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
