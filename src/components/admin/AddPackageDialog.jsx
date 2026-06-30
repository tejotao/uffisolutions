import React, { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { calculateBaseFee } from '@/lib/feeCalculations';
import { useI18n } from '@/contexts/I18nContext';

function AddPackageDialog({ clients, onAdd }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    tracking: '',
    weight: '',
    items: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) {
      toast({
        title: "Erro",
        description: "Cliente não encontrado",
        variant: "destructive"
      });
      return;
    }

    const weight = parseFloat(formData.weight);
    const baseFee = calculateBaseFee(weight);

    const newPackage = {
      ...formData,
      clientName: client.name,
      suite: client.suite,
      weight,
      baseFee,
      photoUrl: null,
      receivedDate: new Date().toISOString().split('T')[0], // Set current date
      extraServices: []
    };

    onAdd(newPackage);
    
    setFormData({ clientId: '', tracking: '', weight: '', items: '' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t('admin.addPackage')}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 text-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            {t('admin.newPackage')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">{t('admin.client')}</Label>
            <Select value={formData.clientId} onValueChange={(value) => setFormData({...formData, clientId: value})}>
              <SelectTrigger className="border-gray-300 bg-gray-50">
                <SelectValue placeholder={t('admin.selectClient')} />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 text-gray-900">
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.suite}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking">{t('admin.trackingNumber')}</Label>
            <Input
              id="tracking"
              value={formData.tracking}
              onChange={(e) => setFormData({...formData, tracking: e.target.value})}
              placeholder="UK123456789GB"
              required
              className="border-gray-300 bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">{t('admin.weight')}</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              placeholder="2.5"
              required
              className="border-gray-300 bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="items">{t('admin.items')}</Label>
            <Input
              id="items"
              value={formData.items}
              onChange={(e) => setFormData({...formData, items: e.target.value})}
              placeholder="Eletrônicos, Roupas"
              required
              className="border-gray-300 bg-gray-50"
            />
          </div>

          <Button type="submit" className="w-full">
            {t('admin.addPackage')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddPackageDialog;