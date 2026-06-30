import React, { useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/contexts/I18nContext';

function AddClientDialog({ onAdd }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', email: '', phone: '' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-green-600 hover:bg-green-700 border-green-600 text-white">
          <Plus className="w-4 h-4" />
          {t('admin.addClient')}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 text-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-600" />
            {t('admin.newClient')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('auth.fullName')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="João Silva"
              required
              className="border-gray-300 bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="joao@exemplo.com"
              required
              className="border-gray-300 bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('admin.phone')}</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+55 11 98765-4321"
              required
              className="border-gray-300 bg-gray-50"
            />
          </div>

          <Button type="submit" className="w-full">
            {t('admin.addClient')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddClientDialog;