
import { supabase } from './supabaseClient';

/**
 * Fetch the community pick count for a restaurant from Supabase.
 * Returns null when Supabase is unconfigured or on any fetch error —
 * callers should hide the count UI rather than display a fabricated number.
 */
export const getRestaurantPickCount = async (name: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('pick_count')
      .eq('name', name)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
      console.warn("Supabase Fetch Error", error);
      return null;
    }

    if (data) {
      return data.pick_count;
    }

    // Row doesn't exist yet — no picks recorded
    return 0;
  } catch (e) {
    console.warn("Supabase unavailable — pick count hidden");
    return null;
  }
};

export const incrementRestaurantPick = async (name: string): Promise<number | null> => {
  try {
    // 1. Check if exists
    const { data: existing } = await supabase
      .from('restaurants')
      .select('pick_count')
      .eq('name', name)
      .single();

    if (existing) {
      // 2. Increment
      const { data, error } = await supabase
        .from('restaurants')
        .update({ pick_count: existing.pick_count + 1 })
        .eq('name', name)
        .select()
        .single();
        
      if (error) throw error;
      return data.pick_count;
    } else {
      // 3. Insert new
      const { data, error } = await supabase
        .from('restaurants')
        .insert([{ name: name, pick_count: 1 }])
        .select()
        .single();
        
      if (error) throw error;
      return data.pick_count;
    }
  } catch (e) {
    console.error("Failed to update DB", e);
    return null;
  }
};
