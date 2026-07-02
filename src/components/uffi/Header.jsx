
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Search, ShieldAlert, Package, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '@/lib/supabaseAuth';
import { getUserRole, ROLES } from '@/lib/rolePermissions';
import { cn, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import Logo from '@/components/uffi/Logo';

const Header = ({
  user,
  searchQuery,
  onSearchChange,
  onShowAllProducts,
  showAllActive = false,
  isAdminPage = false,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const navigate = useNavigate();
  const { t } = useLanguage();

  const userRole = getUserRole(user ?? null);
  const isAdminUser =
    userRole === ROLES.SUPER_ADMIN ||
    userRole === ROLES.ADMIN ||
    userRole === ROLES.MODERATOR;

  // Short name for the badge — first word of full_name or email prefix
  const firstName =
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'User';

  const userInitial = getInitials(user?.full_name, user?.email);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="fixed top-0 w-full z-50 flex flex-col">
      <header
        className={cn(
          'w-full transition-all duration-300 relative z-20',
          isScrolled || mobileMenuOpen
            ? 'bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#2a2a2a]'
            : 'bg-[#0a0a0a] border-b border-[#2a2a2a]'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">

            {/* ── Logo ── */}
            <div className="flex items-center gap-4 group">
              <Logo size="md" clickable={true} />
              <span
                onClick={() => navigate('/')}
                className="text-xl sm:text-2xl font-black text-white tracking-tight transition-colors duration-300 group-hover:text-[#f59e0b] cursor-pointer"
              >
                Uffi<span className="text-[#f59e0b] transition-colors duration-300 group-hover:text-white">Solutions</span>
              </span>
            </div>

            {/* ── Desktop controls ── */}
            <div className="hidden md:flex items-center gap-6">

              {!isAdminPage && (
                <>
                  {/* Search bar */}
                  <div className="flex items-center">
                    <AnimatePresence>
                      {showSearch && (
                        <motion.input
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 200, opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          type="text"
                          placeholder={t('nav.search')}
                          value={searchQuery ?? ''}
                          onChange={(e) => onSearchChange?.(e.target.value)}
                          className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-l-full px-4 py-2 focus:outline-none focus:border-[#f59e0b] transition-colors h-10"
                        />
                      )}
                    </AnimatePresence>
                    <button
                      onClick={() => setShowSearch((s) => !s)}
                      className={cn(
                        'text-gray-400 hover:text-white transition-colors border border-transparent h-10 w-10 flex items-center justify-center',
                        showSearch
                          ? 'bg-[#1a1a1a] border-[#2a2a2a] border-l-0 rounded-r-full'
                          : 'rounded-full hover:bg-[#222]'
                      )}
                      title="Search"
                    >
                      <Search size={18} />
                    </button>
                  </div>

                  <LanguageSwitcher showAllActive={showAllActive} onShowAllProducts={onShowAllProducts} />
                </>
              )}

              {/* ── Auth zone ── */}
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-[#2a2a2a]">
                {user ? (
                  isAdminUser ? (
                    /* Admin: full dropdown with area navigation */
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-3 focus:outline-none bg-[#141414] border border-[#2a2a2a] rounded-full pl-2 pr-4 py-1.5 hover:border-zinc-600 transition-colors">
                        <Avatar className="h-8 w-8 border-2 border-[#f59e0b]">
                          <AvatarFallback className="bg-[#1a1a1a] text-[#f59e0b] text-sm font-bold">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-300 font-medium truncate max-w-[140px]">
                          {user.email}
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 bg-[#141414] border-[#2a2a2a] text-white rounded-xl shadow-xl"
                      >
                        <div className="px-4 py-2 border-b border-[#2a2a2a]">
                          <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                        </div>
                        <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer hover:bg-[#222] focus:bg-[#222] hover:text-[#f59e0b] focus:text-[#f59e0b] text-gray-300 px-4 py-3">
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/products')} className="cursor-pointer hover:bg-[#222] focus:bg-[#222] hover:text-[#f59e0b] focus:text-[#f59e0b] text-gray-300 px-4 py-3">
                          <Package className="mr-2 h-4 w-4" /> My Products
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/dashboard?tab=settings')} className="cursor-pointer hover:bg-[#222] focus:bg-[#222] hover:text-[#f59e0b] focus:text-[#f59e0b] text-gray-300 px-4 py-3">
                          <Settings className="mr-2 h-4 w-4" /> Account Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                        <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer hover:bg-[#222] focus:bg-[#222] text-[#f59e0b] hover:text-[#f59e0b] px-4 py-3 font-bold">
                          <ShieldAlert className="mr-2 h-4 w-4" /> Admin Area
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:bg-[#222] focus:bg-[#222] focus:text-red-400 px-4 py-3">
                          <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    /* Regular user: minimal green "Logged in" badge → /dashboard */
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="border border-emerald-800/60 bg-emerald-950/30 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-2 hover:bg-emerald-900/30 hover:border-emerald-700/60 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      Logged in: {firstName}
                    </button>
                  )
                ) : (
                  /* Guest: Sign In button */
                  <Link
                    to="/login"
                    className="bg-[#f59e0b] hover:bg-[#d97706] text-black px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-[#f59e0b]/20"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* ── Mobile hamburger ── */}
            <div className="flex md:hidden items-center gap-3">
              <button
                className="p-2 text-gray-300 hover:text-white transition-colors focus:outline-none"
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0a0a0a] border-t border-[#2a2a2a] overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">

                {/* User status chip */}
                <div className="flex items-center gap-3 pb-4 border-b border-[#2a2a2a]">
                  {user ? (
                    <button
                      onClick={() => handleNavClick('/dashboard')}
                      className="border border-emerald-800/60 bg-emerald-950/30 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      Logged in: {firstName}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400">{t('nav.guest')}</span>
                  )}
                </div>

                {/* Search + Language (public pages only) */}
                {!isAdminPage && (
                  <>
                    <div className="pt-2 pb-4 border-b border-[#2a2a2a]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                          type="text"
                          placeholder={t('nav.search')}
                          value={searchQuery ?? ''}
                          onChange={(e) => onSearchChange?.(e.target.value)}
                          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#f59e0b]"
                        />
                      </div>
                    </div>
                    <div className="pt-2 pb-4 border-b border-[#2a2a2a]">
                      <LanguageSwitcher
                        showAllActive={showAllActive}
                        onShowAllProducts={() => {
                          onShowAllProducts?.();
                          setMobileMenuOpen(false);
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Nav links */}
                <div className="pt-2 flex flex-col gap-1">
                  {user ? (
                    isAdminUser ? (
                      <>
                        <button onClick={() => handleNavClick('/dashboard')} className="w-full text-left py-3 px-2 text-gray-300 hover:text-white font-medium transition-colors">Dashboard</button>
                        <button onClick={() => handleNavClick('/products')} className="w-full text-left py-3 px-2 text-gray-300 hover:text-white font-medium transition-colors">My Products</button>
                        <button onClick={() => handleNavClick('/admin')} className="w-full text-left py-3 px-2 text-[#f59e0b] hover:text-[#d97706] font-bold transition-colors">Admin Area</button>
                      </>
                    ) : (
                      <button onClick={() => handleNavClick('/dashboard')} className="w-full text-left py-3 px-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                        Go to Dashboard →
                      </button>
                    )
                  ) : (
                    <>
                      <button onClick={() => handleNavClick('/')} className="w-full text-left py-3 px-2 text-gray-300 hover:text-white font-medium transition-colors">{t('nav.home')}</button>
                      <button onClick={() => handleNavClick('/products')} className="w-full text-left py-3 px-2 text-gray-300 hover:text-white font-medium transition-colors">{t('nav.products')}</button>
                    </>
                  )}

                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="mt-4 flex w-full items-center justify-center gap-2 text-red-500 hover:text-red-400 bg-red-500/10 py-3 rounded-xl transition-colors text-sm font-bold"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="mt-4 block w-full text-center bg-[#f59e0b] hover:bg-[#d97706] text-black text-base font-bold rounded-xl py-3 transition-colors shadow-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
};

export default Header;
