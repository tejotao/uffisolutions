export const CATEGORY_MAPPING = {
  'importacao-uk-br': { 
    label: 'Importação', 
    icon: '📦', 
    slugPatterns: ['import'], 
    categoryIds: [1, '1'] 
  },
  'vida-uk': { 
    label: 'Vida no UK', 
    icon: '🇬🇧', 
    slugPatterns: ['vida', 'uk'], 
    categoryIds: [2, '2'] 
  },
  'negocio-online': { 
    label: 'Negócio Online', 
    icon: '💻', 
    slugPatterns: ['negocio', 'online', 'ecommerce'], 
    categoryIds: [3, '3'] 
  },
  'nichos-hobbies': { 
    label: 'Nichos & Hobbies', 
    icon: '🎯', 
    slugPatterns: ['nicho', 'hobby'], 
    categoryIds: [4, '4'] 
  },
  'ferramentas-digitais': { 
    label: 'Ferramentas', 
    icon: '🛠️', 
    slugPatterns: ['ferramenta', 'digital', 'pack'], 
    categoryIds: [5, '5'] 
  },
  'comunidade': { 
    label: 'Comunidade', 
    icon: '🤝', 
    slugPatterns: ['comunidade', 'vip', 'network'], 
    categoryIds: [6, '6'] 
  }
};

export const normalizeProduct = (product) => {
  return {
    ...product,
    active: product.active === null || product.active === undefined ? true : product.active,
    featured: product.featured === null || product.featured === undefined ? false : product.featured,
    image_url: product.image_url || product.image || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
    price: product.price === null || product.price === undefined ? null : product.price,
    category_id: product.category_id === null || product.category_id === undefined ? null : product.category_id,
  };
};

export const mapProductToCategory = (product) => {
  const normalized = normalizeProduct(product);
  
  if (!normalized.category_id && !normalized.slug && !normalized.category) {
    return { ...normalized, mappedCategory: 'negocio-online' };
  }

  let mappedKey = 'negocio-online'; // fallback

  if (normalized.category && CATEGORY_MAPPING[normalized.category]) {
    mappedKey = normalized.category;
  } else {
    for (const [key, mapping] of Object.entries(CATEGORY_MAPPING)) {
      if (normalized.category_id && mapping.categoryIds.includes(normalized.category_id)) {
        mappedKey = key;
        break;
      }
      
      const searchString = `${normalized.slug || ''} ${normalized.title || ''} ${normalized.name || ''}`.toLowerCase();
      if (mapping.slugPatterns.some(pattern => searchString.includes(pattern))) {
        mappedKey = key;
        break;
      }
    }
  }

  return { ...normalized, mappedCategory: mappedKey };
};

export const groupProductsByCategory = (products) => {
  const groups = Object.keys(CATEGORY_MAPPING).reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {});

  products.forEach(p => {
    const mapped = mapProductToCategory(p);
    if (groups[mapped.mappedCategory]) {
      groups[mapped.mappedCategory].push(mapped);
    }
  });

  return groups;
};

export const getCategoryLabel = (categoryKey, t = null) => {
  if (t) {
    const translated = t(`categories.${categoryKey}`);
    if (translated && !translated.includes('categories.')) return translated;
  }
  return CATEGORY_MAPPING[categoryKey]?.label || 'Categoria';
};

export const getCategoryIcon = (categoryKey) => {
  return CATEGORY_MAPPING[categoryKey]?.icon || '📄';
};