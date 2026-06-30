import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getFavorites, 
  addFavorite as dbAddFavorite, 
  removeFavorite as dbRemoveFavorite,
  isFavorite as dbIsFavorite,
  getFavoritesCount
} from '@/lib/favoriteQueries';
import { toast } from '@/components/ui/use-toast';

const FavoritesContext = createContext();

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavorites([]);
      setFavoritesCount(0);
      setLoading(false);
      return;
    }
    
    try {
      const data = await getFavorites(user.id);
      const count = await getFavoritesCount(user.id);
      setFavorites(data);
      setFavoritesCount(count);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFavorites();

    const interval = setInterval(() => {
      fetchFavorites();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchFavorites]);

  const toggleFavorite = async (productId, t) => {
    if (!user?.id) {
      toast({
        title: t ? t('favorites.loginRequired') : 'Login necessário',
        description: t ? t('favorites.loginDesc') : 'Faz login para adicionar aos favoritos.',
        variant: 'destructive'
      });
      return false;
    }

    const currentlyFavorite = favorites.some(f => f.product_id === productId);

    if (currentlyFavorite) {
      const success = await dbRemoveFavorite(user.id, productId);
      if (success) {
        setFavorites(prev => prev.filter(f => f.product_id !== productId));
        setFavoritesCount(prev => Math.max(0, prev - 1));
        toast({ title: t ? t('favorites.removed') : 'Removido dos favoritos' });
      }
      return !success; // return current status
    } else {
      const success = await dbAddFavorite(user.id, productId);
      if (success) {
        // Optimistic update - full refresh happens on poll
        setFavorites(prev => [{ product_id: productId, user_id: user.id }, ...prev]);
        setFavoritesCount(prev => prev + 1);
        toast({ title: t ? t('favorites.added') : 'Adicionado aos favoritos' });
        fetchFavorites(); // Refresh to get product data
      }
      return success;
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(f => f.product_id === productId);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      favoritesCount,
      loading,
      toggleFavorite,
      isFavorite,
      refreshFavorites: fetchFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}