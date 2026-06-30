import { supabase } from './supabaseClient';

// XP level thresholds
export const XP_LEVELS = [
  { name: 'Curioso', minXp: 0, maxXp: 99 },
  { name: 'Iniciante', minXp: 100, maxXp: 299 },
  { name: 'Importador', minXp: 300, maxXp: 599 },
  { name: 'Empreendedor', minXp: 600, maxXp: 999 },
  { name: 'Expert UK', minXp: 1000, maxXp: 1999 },
  { name: 'Master UffiSolutions', minXp: 2000, maxXp: Infinity },
];

// Get current level based on XP
export const getLevelFromXp = (xp) => {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].minXp) return XP_LEVELS[i];
  }
  return XP_LEVELS[0];
};

// Get XP progress to next level (0-100%)
export const getXpProgress = (xp) => {
  const currentLevel = getLevelFromXp(xp);
  if (currentLevel.maxXp === Infinity) return 100;
  const range = currentLevel.maxXp - currentLevel.minXp + 1;
  const progress = xp - currentLevel.minXp;
  return Math.min(100, Math.floor((progress / range) * 100));
};

// Add XP to user profile and update level
export const addXpToUser = async (userId, xpToAdd) => {
  if (!userId || !xpToAdd) return null;
  // Get current XP
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', userId)
    .single();
  if (fetchError) { console.error('addXpToUser fetch error:', fetchError); return null; }
  
  const currentXp = profile?.xp || 0;
  const newXp = currentXp + xpToAdd;
  const oldLevel = getLevelFromXp(currentXp);
  const newLevel = getLevelFromXp(newXp);
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ xp: newXp, level: newLevel.name })
    .eq('id', userId)
    .select()
    .single();
  if (error) { console.error('addXpToUser update error:', error); return null; }
  
  // Return level-up info if user leveled up
  const leveledUp = newLevel.name !== oldLevel.name;
  return { ...data, leveledUp, newLevel: newLevel.name, oldLevel: oldLevel.name };
};