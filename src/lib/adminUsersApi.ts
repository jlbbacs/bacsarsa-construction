import { supabase } from "./supabase";

/**
 * Invokes the admin-users Edge Function and throws with the REAL error
 * message it sent back. supabase-js's FunctionsHttpError only exposes a
 * generic "Edge Function returned a non-2xx status code" on `.message` --
 * the actual `{ error: "..." }` body our function sends has to be read
 * separately from the error's response context, which the SDK doesn't do
 * for you automatically.
 */
export async function callAdminUsers(action: string, body: Record<string, unknown>): Promise<unknown> {
  const { data, error } = await supabase.functions.invoke(`admin-users?action=${action}`, { body });

  if (error) {
    let message = error.message;
    const context = (error as { context?: Response }).context;
    if (context) {
      try {
        const parsed = await context.json();
        if (parsed?.error) message = parsed.error;
      } catch {
        // Response body wasn't JSON -- fall back to the generic SDK message.
      }
    }
    throw new Error(message);
  }

  const responseError = (data as { error?: string } | null)?.error;
  if (responseError) {
    throw new Error(responseError);
  }

  return data;
}
