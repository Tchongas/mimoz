// ============================================
// Tapresente - Safe Data Fetching Utilities
// ============================================
// Wraps database calls with error handling and fallbacks

import { createClient } from '@/lib/supabase/server';

// Result type for safe operations
export type SafeResult<T> = 
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

// Wrap any async operation with error handling
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<SafeResult<T>> {
  try {
    const data = await operation();
    return { success: true, data, error: null };
  } catch (err) {
    console.error('Safe async error:', err);
    if (fallback !== undefined) {
      return { success: true, data: fallback, error: null };
    }
    return { 
      success: false, 
      data: null, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

// Safe Supabase query with timeout
export async function safeQuery<T>(
  queryFn: (supabase: Awaited<ReturnType<typeof createClient>>) => Promise<{ data: T | null; error: unknown }>,
  options?: { fallback?: T; timeout?: number }
): Promise<SafeResult<T>> {
  const { fallback, timeout = 10000 } = options || {};

  try {
    const supabase = await createClient();
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), timeout);
    });

    // Race between query and timeout
    const result = await Promise.race([
      queryFn(supabase),
      timeoutPromise,
    ]);

    if (result.error) {
      console.error('Supabase query error:', result.error);
      if (fallback !== undefined) {
        return { success: true, data: fallback, error: null };
      }
      return { 
        success: false, 
        data: null, 
        error: 'Database query failed' 
      };
    }

    return { 
      success: true, 
      data: result.data as T, 
      error: null 
    };
  } catch (err) {
    console.error('Safe query error:', err);
    if (fallback !== undefined) {
      return { success: true, data: fallback, error: null };
    }
    return { 
      success: false, 
      data: null, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

// Safe count query
export async function safeCount(
  table: string,
  filter?: { column: string; value: string }
): Promise<number> {
  const result = await safeQuery(
    async (supabase) => {
      let query = supabase.from(table).select('id', { count: 'exact', head: true });
      if (filter) {
        query = query.eq(filter.column, filter.value);
      }
      const { count, error } = await query;
      return { data: count, error };
    },
    { fallback: 0 }
  );
  return result.data ?? 0;
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Get configuration status message
export function getConfigStatus(): { configured: boolean; message: string } {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { 
      configured: false, 
      message: 'NEXT_PUBLIC_SUPABASE_URL não configurado' 
    };
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { 
      configured: false, 
      message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY não configurado' 
    };
  }
  return { configured: true, message: 'Supabase configurado' };
}
