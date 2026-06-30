export const CATEGORY_COLORS = {
  'compras-importacao': {
    border: 'border-green-600',
    bg: 'bg-green-600/10',
    text: 'text-green-500',
    btnText: 'text-white bg-green-600 hover:bg-green-700',
    icon: '🛍️',
    label: 'Compras & Importação'
  },
  'viagens-roteiros': {
    border: 'border-blue-600',
    bg: 'bg-blue-600/10',
    text: 'text-blue-500',
    btnText: 'text-white bg-blue-600 hover:bg-blue-700',
    icon: '✈️',
    label: 'Viagens & Roteiros'
  },
  'negocios-ecommerce': {
    border: 'border-red-600',
    bg: 'bg-red-600/10',
    text: 'text-red-500',
    btnText: 'text-white bg-red-600 hover:bg-red-700',
    icon: '💼',
    label: 'Negócios & E-commerce'
  },
  'milhas-vantagens': {
    border: 'border-orange-600',
    bg: 'bg-orange-600/10',
    text: 'text-orange-500',
    btnText: 'text-white bg-orange-600 hover:bg-orange-700',
    icon: '✈️💎',
    label: 'Milhas & Vantagens'
  },
  'ferramentas-utilidades': {
    border: 'border-purple-600',
    bg: 'bg-purple-600/10',
    text: 'text-purple-500',
    btnText: 'text-white bg-purple-600 hover:bg-purple-700',
    icon: '🔧',
    label: 'Ferramentas & Utilidades'
  }
};

const DEFAULT_CATEGORY = {
  border: 'border-gray-600',
  bg: 'bg-gray-600/10',
  text: 'text-gray-500',
  btnText: 'text-white bg-gray-600 hover:bg-gray-700',
  icon: '📁',
  label: 'Outros'
};

export const getCategoryColor = (slug) => {
  if (!slug) return DEFAULT_CATEGORY;
  const normalized = slug.toString().toLowerCase().trim();
  if (!CATEGORY_COLORS[normalized]) {
    console.warn(`Category slug not found: ${slug}`);
    return DEFAULT_CATEGORY;
  }
  return CATEGORY_COLORS[normalized];
};

export const getAllCategories = () => {
  return Object.entries(CATEGORY_COLORS).map(([slug, data]) => ({
    slug,
    ...data
  }));
};

export const getCategoryLabel = (slug) => {
  return getCategoryColor(slug).label;
};

export const getCategoryIcon = (slug) => {
  return getCategoryColor(slug).icon;
};