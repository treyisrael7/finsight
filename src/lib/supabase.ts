import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Debug logging
console.log('Environment variables check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'exists' : 'missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'exists' : 'missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'exists' : 'missing');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY is missing. Some features may not work correctly.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    },
    global: {
      headers: {
        'x-application-name': 'finsight'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Create a service role client for administrative operations
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'x-application-name': 'finsight-admin'
      }
    },
    db: {
      schema: 'public'
    }
  }
);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error.code === 'PGRST116') {
    return 'Profile not found';
  }
  
  if (error.code === '23505') {
    return 'A record with this information already exists';
  }
  
  if (error.code === '42501') {
    return 'You do not have permission to perform this action';
  }
  
  return error.message || 'An unexpected error occurred';
};

// Helper function to get user profile with caching
export const getUserProfile = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()
    .cache(60); // Cache for 60 seconds

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

// Helper function to update user profile
export const updateUserProfile = async (updates: Partial<Database['public']['Tables']['user_profiles']['Update']>) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No session');

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw new Error(handleSupabaseError(error));
  }

  return data;
}; 