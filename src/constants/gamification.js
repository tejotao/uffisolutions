export const LEVELS = [
  { id: 1, name: 'Curioso', minXp: 0, icon: '🥚', color: '#9ca3af' },
  { id: 2, name: 'Iniciante', minXp: 100, icon: '🐣', color: '#3b82f6' },
  { id: 3, name: 'Importador', minXp: 300, icon: '🦅', color: '#10b981' },
  { id: 4, name: 'Empreendedor', minXp: 600, icon: '💼', color: '#f59e0b' },
  { id: 5, name: 'Expert UK', minXp: 1000, icon: '👑', color: '#8b5cf6' },
  { id: 6, name: 'Master UffiSolutions', minXp: 2000, icon: '💎', color: '#ef4444' }
];

export const getLevelByXp = (xp) => {
  const currentXp = xp || 0;
  let currentLevel = LEVELS[0];
  
  for (let i = 0; i < LEVELS.length; i++) {
    if (currentXp >= LEVELS[i].minXp) {
      currentLevel = LEVELS[i];
    } else {
      break;
    }
  }
  
  console.log(`[Gamification] Current XP: ${currentXp} -> Level: ${currentLevel.name}`);
  return currentLevel;
};

export const getNextLevel = (currentLevel) => {
  const currentIndex = LEVELS.findIndex(l => l.id === currentLevel.id);
  if (currentIndex < LEVELS.length - 1) {
    return LEVELS[currentIndex + 1];
  }
  return currentLevel; // Max level reached
};

export const getXpForNextLevel = (currentXp) => {
  const level = getLevelByXp(currentXp);
  const nextLevel = getNextLevel(level);
  
  if (level.id === nextLevel.id) return 0; // Max level
  return nextLevel.minXp - (currentXp || 0);
};

export const getXpProgress = (currentXp) => {
  const xp = currentXp || 0;
  const currentLevel = getLevelByXp(xp);
  const nextLevel = getNextLevel(currentLevel);
  
  if (currentLevel.id === nextLevel.id) {
    return { current: xp, next: xp, percentage: 100, isMax: true };
  }
  
  const xpIntoLevel = xp - currentLevel.minXp;
  const levelTotalXp = nextLevel.minXp - currentLevel.minXp;
  const percentage = Math.min(100, Math.max(0, (xpIntoLevel / levelTotalXp) * 100));
  
  console.log(`[Gamification] Progress: ${percentage.toFixed(2)}% (${xpIntoLevel}/${levelTotalXp})`);
  
  return {
    current: xp,
    next: nextLevel.minXp,
    percentage,
    isMax: false
  };
};