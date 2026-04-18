import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  gold: number;
  gems: number;
  wins: number;
  losses: number;
  pb_record: number;
  created_at: string;
}

export interface UserCard {
  id: string;
  user_id: string;
  card_catalog_index: number;
  quantity: number;
  acquired_at: string;
}

export interface UserChest {
  id: string;
  user_id: string;
  chest_type: string;
  opened_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export async function getUserCards(userId: string): Promise<UserCard[]> {
  const { data } = await supabase
    .from('user_cards')
    .select('*')
    .eq('user_id', userId)
    .order('acquired_at', { ascending: true });
  return data ?? [];
}

export async function getTotalCardCount(userId: string): Promise<number> {
  const { data } = await supabase
    .from('user_cards')
    .select('quantity')
    .eq('user_id', userId);
  return (data ?? []).reduce((sum, row) => sum + row.quantity, 0);
}

export async function hasOpenedChest(userId: string, chestType: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_chests')
    .select('id')
    .eq('user_id', userId)
    .eq('chest_type', chestType)
    .maybeSingle();
  if (error) return false;
  return data !== null;
}

export async function openChest(
  userId: string,
  chestType: string,
  cardIndices: number[],
): Promise<{ success: boolean; error?: string }> {
  // Registrar baú aberto
  const { error: chestError } = await supabase
    .from('user_chests')
    .insert({ user_id: userId, chest_type: chestType });

  if (chestError) {
    return { success: false, error: chestError.message };
  }

  // Inserir cartas
  for (const idx of cardIndices) {
    const { data: existing } = await supabase
      .from('user_cards')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('card_catalog_index', idx)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_cards')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id);
    } else {
      const { error: insertError } = await supabase
        .from('user_cards')
        .insert({ user_id: userId, card_catalog_index: idx, quantity: 1 });
      if (insertError) return { success: false, error: insertError.message };
    }
  }

  return { success: true };
}
