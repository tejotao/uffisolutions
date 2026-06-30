import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative">
      <Header />
      
      <main className="flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <Logo variant="icon" size="medium" />
          <h1 className="text-3xl font-black text-[#f59e0b]">{t('profile.title')}</h1>
        </div>
        
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">{t('profile.name')}</Label>
                <div className="text-lg font-bold">{profile?.full_name || 'N/A'}</div>
              </div>
              <div>
                <Label className="text-gray-400">{t('profile.email')}</Label>
                <div className="text-lg">{user.email}</div>
              </div>
              <div>
                <Label className="text-gray-400">{t('profile.lang')}</Label>
                <div className="text-lg uppercase">{profile?.preferred_language || 'PT-BR'}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">{t('profile.xp')}</Label>
                <div className="text-3xl font-black text-[#f59e0b]">{profile?.xp || 0}</div>
              </div>
              <div>
                <Label className="text-gray-400">{t('profile.level')}</Label>
                <div className="inline-block bg-[#1c1c1c] border border-[#f59e0b] px-3 py-1 rounded-full text-sm font-bold text-[#f59e0b]">
                  {t(`gamification.levels.${profile?.level}`) || profile?.level || 'Curioso'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-[#2a2a2a] flex flex-wrap gap-4">
            <Button variant="outline" className="border-[#333] hover:bg-[#1c1c1c] text-white">
              {t('profile.edit')}
            </Button>
            <Button variant="outline" className="border-[#333] hover:bg-[#1c1c1c] text-white">
              {t('profile.changePwd')}
            </Button>
            <Button variant="destructive" onClick={signOut}>
              {t('profile.logout')}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}