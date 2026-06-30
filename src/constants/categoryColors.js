export const CATEGORY_COLORS = {
  'importacao-hubukbox': {
    bg: '#1e3a8a',
    border: '#1e40af',
    label: 'Importação HubUKBox',
    icon: '📦',
    gradient: 'from-blue-600 to-blue-800',
    accentLight: '#3b82f6',
    accentDark: '#1e3a8a'
  },
  'nichos-hobby': {
    bg: '#065f46',
    border: '#047857',
    label: 'Nichos e Hobbies',
    icon: '🎨',
    gradient: 'from-emerald-600 to-emerald-800',
    accentLight: '#10b981',
    accentDark: '#065f46'
  },
  'negocio-online': {
    bg: '#b45309',
    border: '#d97706',
    label: 'Negócio Online',
    icon: '💻',
    gradient: 'from-amber-600 to-amber-800',
    accentLight: '#f59e0b',
    accentDark: '#b45309'
  },
  'vida-uk': {
    bg: '#c2410c',
    border: '#ea580c',
    label: 'Vida no UK',
    icon: '🇬🇧',
    gradient: 'from-orange-600 to-orange-800',
    accentLight: '#f97316',
    accentDark: '#c2410c'
  },
  'comunidade': {
    bg: '#b91c1c',
    border: '#dc2626',
    label: 'Comunidade',
    icon: '🤝',
    gradient: 'from-red-600 to-red-800',
    accentLight: '#ef4444',
    accentDark: '#b91c1c'
  },
  'ferramentas-digitais': {
    bg: '#6d28d9',
    border: '#7c3aed',
    label: 'Ferramentas Digitais',
    icon: '🛠️',
    gradient: 'from-violet-600 to-violet-800',
    accentLight: '#8b5cf6',
    accentDark: '#6d28d9'
  }
};

export const getCategoryColor = (slug) => {
  return CATEGORY_COLORS[slug] || CATEGORY_COLORS['importacao-hubukbox'];
};