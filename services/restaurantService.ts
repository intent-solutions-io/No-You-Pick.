
import { supabase } from './supabaseClient';

// Fallback algorithm if DB connection fails or is not configured
const generatePseudoCount = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 3000 + (Math.abs(hash) % 9000);
};

export const getRestaurantPickCount = async (name: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('pick_count')
      .eq('name', name)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
      console.warn("Supabase Fetch Error", error);
      return generatePseudoCount(name);
    }

    if (data) {
      return data.pick_count;
    }

    // If row doesn't exist, we return 0 (or a starting number)
    return 0; 
  } catch (e) {
    console.warn("Using fallback stats due to config error");
    return generatePseudoCount(name);
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
