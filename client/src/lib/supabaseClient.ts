import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface MockSupabaseClient {
  auth: {
    signInWithOtp: (options: { email: string }) => Promise<{ error: null }>;
    signOut: () => Promise<{ error: null }>;
    getUser: () => Promise<{ data: { user: null }, error: null }>;
    onAuthStateChange: (callback: (event: string, session: any) => void) => { data: { subscription: { unsubscribe: () => void } } };
  };
  from: (table: string) => {
    select: () => Promise<{ data: [], error: null }>;
    insert: (data: any) => Promise<{ data: null, error: null }>;
    update: (data: any) => Promise<{ data: null, error: null }>;
    delete: () => Promise<{ data: null, error: null }>;
  };
}

function createMockClient(): MockSupabaseClient {
  console.warn('Supabase environment variables not found. Using mock client for development.');
  
  return {
    auth: {
      signInWithOtp: async ({ email }) => {
        console.log('Mock: Sign in with email:', email);
        return { error: null };
      },
      signOut: async () => {
        console.log('Mock: Sign out');
        return { error: null };
      },
      getUser: async () => {
        return { data: { user: null }, error: null };
      },
      onAuthStateChange: (callback) => {
        return {
          data: {
            subscription: {
              unsubscribe: () => console.log('Mock: Unsubscribed from auth changes')
            }
          }
        };
      },
    },
    from: (table: string) => ({
      select: async () => {
        console.log(`Mock: SELECT from ${table}`);
        return { data: [], error: null };
      },
      insert: async (data) => {
        console.log(`Mock: INSERT into ${table}:`, data);
        return { data: null, error: null };
      },
      update: async (data) => {
        console.log(`Mock: UPDATE ${table}:`, data);
        return { data: null, error: null };
      },
      delete: async () => {
        console.log(`Mock: DELETE from ${table}`);
        return { data: null, error: null };
      },
    }),
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | MockSupabaseClient = 
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : createMockClient();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
