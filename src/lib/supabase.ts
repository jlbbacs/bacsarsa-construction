import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let warned = false;
function warnOnce() {
  if (warned) return;
  warned = true;
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. " +
      "Running with placeholder content only -- see README.md to connect a real Supabase project."
  );
}

/**
 * A chainable no-op query builder: every method (select/eq/order/range/...)
 * returns itself, and awaiting it (or calling .single()) resolves to an
 * empty result instead of making a network call. This lets every page and
 * hook run its normal Supabase call chain with zero setup, falling through
 * to each hook's FALLBACK_* content.
 */
function createStubQueryBuilder(): unknown {
  const emptyResult = { data: null, error: { message: "Supabase not configured" }, count: 0 };
  const builder: Record<string, unknown> = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") {
          warnOnce();
          return (resolve: (v: typeof emptyResult) => void) => resolve(emptyResult);
        }
        if (prop === "single" || prop === "maybeSingle") {
          return () => {
            warnOnce();
            return Promise.resolve(emptyResult);
          };
        }
        return () => builder;
      },
    }
  );
  return builder;
}

function createStubStorageBucket() {
  return {
    upload: async () => {
      warnOnce();
      return { data: null, error: { message: "Supabase not configured" } };
    },
    getPublicUrl: () => ({ data: { publicUrl: "" } }),
    remove: async () => ({ data: null, error: { message: "Supabase not configured" } }),
  };
}

function createStubClient(): SupabaseClient {
  return {
    from: () => createStubQueryBuilder(),
    storage: { from: () => createStubStorageBucket() },
    auth: {
      getSession: async () => {
        warnOnce();
        return { data: { session: null }, error: null };
      },
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => ({
        data: { session: null, user: null },
        error: {
          message:
            "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.",
        },
      }),
      signOut: async () => ({ error: null }),
    },
  } as unknown as SupabaseClient;
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createStubClient();
