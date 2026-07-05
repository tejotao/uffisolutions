/**
 * AdminLayout — persistent sidebar + grouped navigation for all admin pages.
 * Groups are collapsible. Does NOT touch AuthContext or ProtectedRoute logic.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, Users, ShieldCheck,
  LogOut, Menu, X, ChevronLeft, ChevronDown,
  Layers, UserCog, Gauge, LifeBuoy,
} from 'lucide-react';
import Logo from '@/components/uffi/Logo';
import { logout } from '@/lib/supabaseAuth';
import { cn, getInitials } from '@/lib/utils';

// ─── Navigation groups ────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    id:    'overview',
    label: 'Overview',
    icon:  Gauge,
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin', exact: true },
    ],
  },
  {
    id:    'content',
    label: 'Content',
    icon:  Layers,
    items: [
      { label: 'Products',   icon: Package, path: '/admin/products'   },
      { label: 'Categories', icon: Tags,    path: '/admin/categories' },
    ],
  },
  {
    id:    'users',
    label: 'Users & Access',
    icon:  UserCog,
    items: [
      { label: 'Users',        icon: Users,       path: '/admin/users'         },
      { label: 'Access Board', icon: ShieldCheck,  path: '/admin/access-board' },
      { label: 'Support',      icon: LifeBuoy,     path: '/admin/support'      },
    ],
  },
];

// ─── Role styling ─────────────────────────────────────────────────────────────

const ROLE_STYLE = {
  super_admin: { label: 'Super Admin', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  admin:       { label: 'Admin',       cls: 'text-purple-400 bg-purple-500/10 border-purple-500/25' },
  moderator:   { label: 'Moderator',   cls: 'text-blue-400 bg-blue-500/10 border-blue-500/25' },
};

// ─── Sidebar group ────────────────────────────────────────────────────────────

function NavGroup({ group, isActiveGroup, collapsed, onToggle, onNav, isActivePath }) {
  const GroupIcon = group.icon;

  return (
    <div className="mb-1">
      {/* Group header */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
          isActiveGroup
            ? 'text-amber-400/80 bg-amber-500/5'
            : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/40'
        )}
      >
        <span className="flex items-center gap-2">
          <GroupIcon size={12} />
          {group.label}
        </span>
        <ChevronDown
          size={12}
          className={cn('transition-transform duration-200', collapsed ? '-rotate-90' : '')}
        />
      </button>

      {/* Group items */}
      {!collapsed && (
        <div className="mt-0.5 space-y-0.5 pl-2">
          {group.items.map((item) => {
            const Icon   = item.icon;
            const active = isActivePath(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNav}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-amber-500/12 text-amber-400 border border-amber-500/25 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                )}
              >
                {/* Active indicator bar */}
                {active && (
                  <span className="absolute left-0 w-0.5 h-5 bg-amber-400 rounded-r" />
                )}
                <Icon size={14} className={active ? 'text-amber-400' : 'text-zinc-500'} />
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────

export default function AdminLayout({ user, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState({}); // { groupId: true/false }

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    navigate('/');
  };

  const isActivePath = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  const isActiveGroup = (group) =>
    group.items.some((item) => isActivePath(item));

  const toggleGroup = (id) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const initial     = getInitials(user?.full_name, user?.email);
  const displayName = user?.email?.split('@')[0] ?? 'Admin';
  const role        = user?.role ?? 'admin';
  const roleStyle   = ROLE_STYLE[role] || { label: role, cls: 'text-zinc-400 bg-zinc-800 border-zinc-700' };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">

      {/* ══ Top bar ══ */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center gap-3 px-4
        bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80">

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Logo */}
        <Link to="/admin" className="flex items-center gap-2 group shrink-0">
          <Logo size="sm" clickable={false} />
          <span className="font-black text-sm hidden sm:block group-hover:text-amber-400 transition-colors">
            Uffi<span className="text-amber-400 group-hover:text-white transition-colors">Admin</span>
          </span>
        </Link>

        {/* Current page breadcrumb */}
        <div className="hidden md:flex items-center gap-2 ml-2 text-xs text-zinc-600">
          <ChevronLeft size={12} className="rotate-180" />
          {NAV_GROUPS.flatMap((g) => g.items).find((i) => isActivePath(i))?.label || 'Admin'}
        </div>

        <div className="flex-grow" />

        {/* User chip */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-full pl-1.5 pr-3 py-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-black text-black shadow-sm">
              {initial}
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[11px] text-white font-semibold">{displayName}</span>
              <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full border mt-0.5 w-fit', roleStyle.cls)}>
                {roleStyle.label}
              </span>
            </div>
          </div>

          <Link to="/dashboard" title="My Dashboard"
            className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 border border-transparent hover:border-zinc-700">
            <ChevronLeft size={11} /> My Area
          </Link>

          <button onClick={handleLogout} title="Sign Out"
            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ══ Body ══ */}
      <div className="flex pt-14 flex-grow">

        {/* ══ Sidebar ══ */}
        <aside className={cn(
          'fixed top-14 left-0 bottom-0 z-40 w-56 flex flex-col',
          'bg-zinc-950 border-r border-zinc-800/80',
          'transition-transform duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>

          {/* Subtle top accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent shrink-0" />

          {/* Navigation groups */}
          <nav className="flex-grow py-4 px-2.5 overflow-y-auto space-y-1 relative">
            {NAV_GROUPS.map((group) => (
              <NavGroup
                key={group.id}
                group={group}
                isActiveGroup={isActiveGroup(group)}
                collapsed={collapsed[group.id] ?? false}
                onToggle={() => toggleGroup(group.id)}
                onNav={() => setMobileOpen(false)}
                isActivePath={isActivePath}
              />
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="shrink-0 px-3 py-3 border-t border-zinc-800/60 space-y-1">
            {/* System status */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">System Online</span>
            </div>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-zinc-900">
              <ChevronLeft size={11} /> Back to My Dashboard
            </Link>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* ══ Main content ══ */}
        <main className="flex-grow lg:ml-56 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
