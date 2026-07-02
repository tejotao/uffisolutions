
import React from 'react';
import { ShieldOff, Mail, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { logout, clearAllAuthTokens } from '@/lib/supabaseAuth';
import Logo from '@/components/uffi/Logo';

const SUPPORT_EMAIL = 'us@uffisolutions.com';

export default function BlockedPage() {
  const handleSignOut = async () => {
    await logout();
    clearAllAuthTokens();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="flex justify-center mb-6"><Logo size="lg" /></div>
          <h2 className="text-3xl font-black text-white tracking-tight">Account blocked</h2>
          <p className="mt-2 text-sm text-gray-400">Your access to UffiSolutions has been suspended.</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#141414] py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-[#2a2a2a]">
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
              <ShieldOff size={28} className="text-red-400" />
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              This may be due to a payment, permissions or compliance issue. Please contact
              support to review your account and restore access.
            </p>

            <a href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              <Mail size={16} /> Contact support
            </a>

            <button onClick={handleSignOut}
              className="mt-1 flex items-center gap-2 text-zinc-500 hover:text-white text-xs transition-colors">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
