import { supabase } from "./supabase";

export async function testSupabaseConnection() {
  // Try to fetch the current timestamp from Supabase
  const { data, error } = await supabase.rpc('now');
  if (error) {
    throw new Error(`Supabase connection failed: ${error.message}`);
  }
  return data;
}
