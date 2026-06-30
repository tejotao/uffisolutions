import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDebug() {
  const { user, isAdmin } = useAuth();
  
  // Render nothing in production unless specifically needing a fallback
  if (!import.meta.env.DEV && !user) return null;

  return (
    <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg mb-4 text-white text-sm">
      <h3 className="font-bold text-red-500 mb-2">DEBUG - Admin Status</h3>
      <p>User Email: <span className="font-mono">{user?.email || 'NOT SET'}</span></p>
      <p>Is Admin: <span className="font-mono font-bold text-[#f59e0b]">{isAdmin() ? 'YES' : 'NO'}</span></p>
      <p>Expected: <span className="font-mono">tejotao@gmail.com</span></p>
      <p>Match: <span className="font-mono">{user?.email?.toLowerCase() === 'tejotao@gmail.com' ? 'YES' : 'NO'}</span></p>
    </div>
  );
}