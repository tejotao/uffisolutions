import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Package, LogOut, Heart } from 'lucide-react';

export default function UserAvatar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { favoritesCount } = useFavorites();
  const { t } = useI18n();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-10 w-10 border-2 border-[#f59e0b] cursor-pointer hover:opacity-80 transition-opacity shadow-[0_0_10px_rgba(245,158,11,0.3)]">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="bg-[#1c1c1c] text-[#f59e0b] font-bold">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-[#141414] border-[#2a2a2a] text-white shadow-2xl">
        <div className="px-2 py-1.5 text-sm">
          <div className="font-bold text-white truncate">{profile?.full_name || user.email}</div>
          <div className="text-gray-400 text-xs truncate">{user.email}</div>
        </div>
        <DropdownMenuSeparator className="bg-[#2a2a2a]" />
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-[#1c1c1c] focus:bg-[#1c1c1c]">
          <Link to="/profile" className="flex items-center w-full">
            <User className="mr-2 h-4 w-4 text-[#f59e0b]" />
            <span>{t('profile.title')}</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-[#1c1c1c] focus:bg-[#1c1c1c]">
          <Link to="/meus-produtos" className="flex items-center w-full">
            <Package className="mr-2 h-4 w-4 text-[#f59e0b]" />
            <span>{t('profile.myProducts')}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer hover:bg-[#1c1c1c] focus:bg-[#1c1c1c]">
          <Link to="/favorites" className="flex items-center w-full">
            <Heart className="mr-2 h-4 w-4 text-red-500" />
            <span>{t('favorites.title') || 'Meus Favoritos'} ({favoritesCount})</span>
          </Link>
        </DropdownMenuItem>

        {isAdmin() && (
          <>
            <DropdownMenuSeparator className="bg-[#2a2a2a]" />
            <DropdownMenuItem asChild className="cursor-pointer bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-500 font-bold focus:bg-amber-100 dark:focus:bg-amber-900/40 focus:text-amber-600">
              <Link to="/admin" className="flex items-center w-full">
                <span className="mr-2">👑</span>
                <span>Painel Admin</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="bg-[#2a2a2a]" />
        
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500 hover:bg-[#1c1c1c] hover:text-red-400 focus:bg-[#1c1c1c] focus:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('profile.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}