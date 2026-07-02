
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest'
};

export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    products: ['create', 'read', 'update', 'delete', 'feature'],
    categories: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete', 'block', 'changeRole', 'resetPassword'],
    analytics: ['read'],
    settings: ['read', 'update'],
    system: ['read', 'update']
  },
  [ROLES.ADMIN]: {
    products: ['create', 'read', 'update', 'delete', 'feature'],
    categories: ['create', 'read', 'update', 'delete'],
    users: ['read', 'update', 'block', 'resetPassword'],
    analytics: ['read'],
    settings: ['read'],
    system: []
  },
  [ROLES.MODERATOR]: {
    products: ['read', 'update'],
    categories: ['read'],
    users: ['read'],
    analytics: [],
    settings: [],
    system: []
  },
  [ROLES.USER]: {
    products: ['read'],
    categories: ['read'],
    users: [],
    analytics: [],
    settings: [],
    system: []
  },
  [ROLES.GUEST]: {
    products: ['read'],
    categories: ['read'],
    users: [],
    analytics: [],
    settings: [],
    system: []
  }
};

export const isSuperAdmin = (email) => {
  return email === 'tejotao@gmail.com';
};

export const getUserRole = (user) => {
  if (!user) return ROLES.GUEST;
  if (isSuperAdmin(user.email)) return ROLES.SUPER_ADMIN;
  return user.role || (user.is_admin ? ROLES.ADMIN : ROLES.USER);
};

export const hasPermission = (userRole, resource, action) => {
  return PERMISSIONS[userRole]?.[resource]?.includes(action) || false;
};

export const canAccess = (user, resource, action) => {
  const role = getUserRole(user);
  return hasPermission(role, resource, action);
};

export const getUserPermissions = (user) => {
  const role = getUserRole(user);
  return PERMISSIONS[role] || {};
};
