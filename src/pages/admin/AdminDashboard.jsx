
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, Tags, Users, BarChart3,
  TrendingUp, CheckCircle, Shield, Loader2, ShieldCheck,
  ArrowUpRight, Activity, Star, Globe,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';
import { fetchAllProductsAllLanguages, fetchAllUsers } from '@/lib/catalogQueries';
import { canAccess, getUserRole, ROLES, getUserPermissions } from '@/lib/rolePermissions';
import { cn } from '@/lib/utils';

// ─── Animated counter ─────────────────────────────────────────────────────────

function CountUp({ to, duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!to) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return <span>{val}</span>;
}

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, color, glow, trend, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-3 cursor-default',
        'bg-zinc-900/70 backdrop-blur-sm',
        color.border
      )}
      style={{ boxShadow: loading ? 'none' : `0 0 40px -10px ${glow}` }}
    >
      {/* Background glow blob */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: glow }} />

      <div className="flex items-start justify-between">
        <div className={cn('p-2.5 rounded-xl border', color.iconBg, color.iconBorder)}>
          <Icon size={18} className={color.icon} />
        </div>
        {trend !== undefined && (
          <span className={cn('flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-full',
            trend >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10')}>
            <TrendingUp size={10} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div>
        {loading ? (
          <div className="h-9 w-16 bg-zinc-800 rounded-lg animate-pulse" />
        ) : (
          <p className={cn('text-3xl font-black', color.value)}>
            <CountUp to={value} />
          </p>
        )}
        <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Quick-nav card ────────────────────────────────────────────────────────────

function NavCard({ icon: Icon, label, desc, to, color, delay = 0 }) {
  const navigate = useNavigate();
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.2 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(to)}
      className={cn(
        'group flex items-center gap-4 p-4 rounded-2xl border text-left w-full',
        'bg-zinc-900/60 hover:bg-zinc-900 transition-all duration-200',
        color.border, 'hover:shadow-lg'
      )}
      style={{ '--hover-shadow': color.glow }}
    >
      <div className={cn('p-3 rounded-xl border shrink-0 transition-transform group-hover:scale-110', color.iconBg, color.iconBorder)}>
        <Icon size={20} className={color.icon} />
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-bold text-white text-sm">{label}</p>
        <p className="text-[10px] text-zinc-500 truncate">{desc}</p>
      </div>
      <ArrowUpRight size={16} className="text-zinc-600 group-hover:text-white transition-colors shrink-0" />
    </motion.button>
  );
}

// ─── Colors palette ────────────────────────────────────────────────────────────

const AMBER = {
  border: 'border-amber-500/20', icon: 'text-amber-400',
  iconBg: 'bg-amber-500/10', iconBorder: 'border-amber-500/20',
  value: 'text-amber-400', glow: '#f59e0b',
};
const BLUE = {
  border: 'border-blue-500/20', icon: 'text-blue-400',
  iconBg: 'bg-blue-500/10', iconBorder: 'border-blue-500/20',
  value: 'text-blue-400', glow: '#3b82f6',
};
const EMERALD = {
  border: 'border-emerald-500/20', icon: 'text-emerald-400',
  iconBg: 'bg-emerald-500/10', iconBorder: 'border-emerald-500/20',
  value: 'text-emerald-400', glow: '#10b981',
};
const PURPLE = {
  border: 'border-purple-500/20', icon: 'text-purple-400',
  iconBg: 'bg-purple-500/10', iconBorder: 'border-purple-500/20',
  value: 'text-purple-400', glow: '#8b5cf6',
};

const CHART_STYLE = { backgroundColor: '#0f0f0f', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' };

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading]     = useState(true);
  const [metrics, setMetrics]     = useState({ users: 0, confirmed: 0, products: 0, newUsers: 0 });
  const [charts, setCharts]       = useState({ byLang: [], byPrice: [] });
  const [error, setError]         = useState(null);

  const role           = getUserRole(user);
  const isSuperAdmin   = role === ROLES.SUPER_ADMIN;
  const userPermissions = getUserPermissions(user);
  const permissions    = {
    analytics:  canAccess(user, 'analytics',  'read'),
    products:   canAccess(user, 'products',   'read'),
    categories: canAccess(user, 'categories', 'read'),
    users:      canAccess(user, 'users',      'read'),
  };

  const displayName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Admin';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [usrs, prods] = await Promise.all([
          fetchAllUsers(),
          fetchAllProductsAllLanguages(),
        ]);

        const users    = usrs   || [];
        const products = prods  || [];
        const cutoff   = new Date(Date.now() - 7 * 86400000);

        setMetrics({
          users:     users.length,
          confirmed: users.filter((u) => u.email_confirmed_at).length,
          products:  products.length,
          newUsers:  users.filter((u) => new Date(u.created_at || 0) >= cutoff).length,
        });

        // Charts
        const langMap = {};
        let free = 0, paid = 0;
        products.forEach((p) => {
          const l = (p.language || 'PT').toUpperCase();
          langMap[l] = (langMap[l] || 0) + 1;
          if (p.is_free || parseFloat(p.price || 0) === 0) free++; else paid++;
        });

        setCharts({
          byLang:  Object.entries(langMap).map(([name, value]) => ({ name, value })),
          byPrice: [{ name: 'Free', value: free }, { name: 'Paid', value: paid }],
        });
      } catch (err) {
        console.error('AdminDashboard load error:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const roleBadge = () => {
    const map = {
      [ROLES.SUPER_ADMIN]: { cls: 'text-red-400 bg-red-500/10 border-red-500/25',    label: '🔥 Super Admin' },
      [ROLES.ADMIN]:       { cls: 'text-purple-400 bg-purple-500/10 border-purple-500/25', label: '👑 Admin' },
      [ROLES.MODERATOR]:   { cls: 'text-blue-400 bg-blue-500/10 border-blue-500/25', label: '🛡 Moderator' },
    };
    const r = map[role] || { cls: 'text-zinc-400 bg-zinc-800 border-zinc-700', label: role };
    return (
      <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full border', r.cls)}>
        {r.label}
      </span>
    );
  };

  const localTabs = [
    { id: 'overview',    label: 'Overview'  },
    ...(permissions.analytics ? [{ id: 'analytics', label: 'Analytics' }] : []),
    { id: 'permissions', label: 'My Role'  },
  ];

  return (
    <AdminLayout user={user}>
      <div className="min-h-screen bg-zinc-950">

        {/* ── Hero header ── */}
        <div className="relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-zinc-950 to-zinc-950 pointer-events-none" />
          <div className="absolute top-0 left-1/3 w-96 h-48 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

          <div className="relative px-6 sm:px-8 pt-8 pb-6 border-b border-zinc-800/60">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-amber-500/25">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Admin Panel</p>
                    <h1 className="text-lg font-black text-white flex items-center gap-2">
                      {displayName} {roleBadge()}
                    </h1>
                  </div>
                </div>
                <p className="text-xs text-zinc-600 ml-13">
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Live status */}
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-zinc-400">System <span className="text-emerald-400 font-bold">Online</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-6 max-w-7xl mx-auto space-y-8">

          {/* ── Metric cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard icon={Users}       label="Total Users"       value={metrics.users}     color={AMBER}   glow="#f59e0b33" trend={metrics.newUsers > 0 ? metrics.newUsers : undefined} loading={loading} />
            <MetricCard icon={CheckCircle} label="Confirmed Emails"  value={metrics.confirmed} color={EMERALD} glow="#10b98133" loading={loading} />
            <MetricCard icon={Package}     label="Total Products"    value={metrics.products}  color={BLUE}    glow="#3b82f633" loading={loading} />
            <MetricCard icon={Activity}    label="New This Week"      value={metrics.newUsers}  color={PURPLE}  glow="#8b5cf633" loading={loading} />
          </div>

          {/* ── Quick navigation ── */}
          <div>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ArrowUpRight size={12} /> Quick Access
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <NavCard icon={Package}    label="Products"     desc="Manage catalog & content"    to="/admin/products"      color={BLUE}    delay={0.05} />
              <NavCard icon={Tags}       label="Categories"   desc="Organise product categories" to="/admin/categories"    color={EMERALD} delay={0.1}  />
              <NavCard icon={Users}      label="Users"        desc="Manage access & accounts"    to="/admin/users"         color={AMBER}   delay={0.15} />
              <NavCard icon={ShieldCheck} label="Access Board" desc="Drag-and-drop grants"      to="/admin/access-board"  color={PURPLE}  delay={0.2}  />
            </div>
          </div>

          {/* ── Tab bar ── */}
          <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800 rounded-xl p-1 w-fit">
            {localTabs.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-semibold transition-all',
                  activeTab === t.id
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                )}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary stats */}
              <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={16} className="text-amber-400" /> Products by Language
                </h3>
                {loading ? (
                  <div className="h-40 flex items-center justify-center text-zinc-600 gap-2">
                    <Loader2 size={16} className="animate-spin" /> Loading...
                  </div>
                ) : charts.byLang.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={charts.byLang} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                      <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                      <RechartsTip contentStyle={CHART_STYLE} cursor={{ fill: '#ffffff08' }} />
                      <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Products" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Free vs Paid donut-like summary */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex flex-col">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Star size={16} className="text-amber-400" /> Product Mix
                </h3>
                {loading ? (
                  <div className="flex-grow flex items-center justify-center text-zinc-600 gap-2">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                ) : (
                  <div className="flex-grow space-y-3">
                    {charts.byPrice.map((item) => {
                      const total = charts.byPrice.reduce((s, x) => s + x.value, 0);
                      const pct   = total > 0 ? Math.round((item.value / total) * 100) : 0;
                      const isF   = item.name === 'Free';
                      return (
                        <div key={item.name}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className={isF ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                              {item.name}
                            </span>
                            <span className="text-zinc-500">{item.value} products · {pct}%</span>
                          </div>
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className={cn('h-full rounded-full', isF ? 'bg-emerald-400' : 'bg-amber-400')}
                            />
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-4 mt-2 border-t border-zinc-800 grid grid-cols-2 gap-3">
                      <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                        <p className="text-xl font-black text-white">{metrics.users}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Total Users</p>
                      </div>
                      <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                        <p className="text-xl font-black text-emerald-400">
                          {metrics.users > 0 ? Math.round((metrics.confirmed / metrics.users) * 100) : 0}%
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Confirmed</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && permissions.analytics && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Globe size={16} className="text-blue-400" /> Language Distribution
              </h3>
              {loading ? (
                <div className="h-48 flex items-center justify-center text-zinc-600 gap-2">
                  <Loader2 size={16} className="animate-spin" /> Loading...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={charts.byLang} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                    <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                    <RechartsTip contentStyle={CHART_STYLE} cursor={{ fill: '#ffffff08' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Products" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Shield size={16} className="text-purple-400" /> My Role Permissions
                <span className="ml-auto text-[10px] text-zinc-600 font-normal">{role.toUpperCase()}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(userPermissions).map(([resource, actions]) => (
                  <div key={resource} className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4">
                    <p className="text-xs font-bold text-white capitalize mb-3 pb-2 border-b border-zinc-800 flex items-center justify-between">
                      {resource}
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-bold border',
                        actions.length > 0
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : 'text-zinc-600 bg-zinc-800 border-zinc-700')}>
                        {actions.length > 0 ? `${actions.length} actions` : 'no access'}
                      </span>
                    </p>
                    {actions.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {actions.map((a) => (
                          <span key={a} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-600 italic">No permissions assigned.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm flex items-center gap-3">
              <Shield size={16} className="shrink-0" /> {error}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
