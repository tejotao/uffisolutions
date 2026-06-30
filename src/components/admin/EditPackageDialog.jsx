import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { calculateBaseFee, calculateStorageFee, EXTRA_SERVICES } from '@/lib/feeCalculations';
import { useI18n } from '@/contexts/I18nContext';

function EditPackageDialog({ package: pkg, clients, onClose, onUpdate }) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    ...pkg,
    shippingCost: pkg.shippingCost || 0,
    finalTracking: pkg.finalTracking || ''
  });

  // Recalculate storage fee on initial load
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      storageFee: calculateStorageFee(prev.receivedDate, prev.status)
    }));
  }, [pkg.receivedDate, pkg.status]);

  const handleExtraServiceToggle = (service) => {
    const services = formData.extraServices || [];
    const newServices = services.includes(service)
      ? services.filter(s => s !== service)
      : [...services, service];
    
    setFormData({ ...formData, extraServices: newServices });
  };

  const calculateTotal = () => {
    let total = formData.baseFee + formData.storageFee + parseFloat(formData.shippingCost || 0);
    
    (formData.extraServices || []).forEach(service => {
      const serviceData = EXTRA_SERVICES.find(s => s.name === service);
      if (serviceData) total += serviceData.price;
    });

    return total;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedPackage = {
      ...formData,
      totalInvoice: calculateTotal() // Always calculate total invoice on update
    };

    onUpdate(updatedPackage);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-blue-600">{t('admin.editPackage')} - {pkg.tracking}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.status')}</Label>
              <Select value={formData.status} onValueChange={(value) => {
                const newStorageFee = calculateStorageFee(formData.receivedDate, value);
                setFormData({...formData, status: value, storageFee: newStorageFee});
              }}>
                <SelectTrigger className="border-gray-300 bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-gray-900">
                  <SelectItem value="Recebido">Recebido</SelectItem>
                  <SelectItem value="Em Espera">Em Espera</SelectItem>
                  <SelectItem value="Aguardando Pagamento">Aguardando Pagamento</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Enviado">Enviado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('admin.weight')}</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => {
                  const weight = parseFloat(e.target.value);
                  setFormData({
                    ...formData,
                    weight,
                    baseFee: calculateBaseFee(weight)
                  });
                }}
                className="border-gray-300 bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('admin.extraServices')}</Label>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {EXTRA_SERVICES.map(service => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={(formData.extraServices || []).includes(service.name)}
                      onCheckedChange={() => handleExtraServiceToggle(service.name)}
                      className="border-gray-400"
                    />
                    <span className="text-gray-800">{service.name}</span>
                  </div>
                  <span className="text-gray-600">£{service.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('admin.shippingCost')} (£)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.shippingCost}
              onChange={(e) => setFormData({...formData, shippingCost: e.target.value})}
              placeholder="25.00"
              className="border-gray-300 bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label>{t('admin.finalTracking')}</Label>
            <Input
              value={formData.finalTracking}
              onChange={(e) => setFormData({...formData, finalTracking: e.target.value})}
              placeholder="RN123456789GB"
              className="border-gray-300 bg-gray-50"
            />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-700 mb-2">{t('admin.invoiceSummary')}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>{t('admin.baseFee')}:</span>
                <span>£{formData.baseFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>{t('admin.storage')}:</span>
                <span>£{formData.storageFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>{t('admin.shipping')}:</span>
                <span>£{parseFloat(formData.shippingCost || 0).toFixed(2)}</span>
              </div>
              {(formData.extraServices || []).map(service => {
                const serviceData = EXTRA_SERVICES.find(s => s.name === service);
                return serviceData ? (
                  <div key={service} className="flex justify-between text-gray-700">
                    <span>{service}:</span>
                    <span>£{serviceData.price.toFixed(2)}</span>
                  </div>
                ) : null;
              })}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>{t('admin.total')}:</span>
                <span>£{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4" />
              {t('admin.saveChanges')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-gray-300 hover:bg-gray-100">
              <X className="w-4 h-4" />
              {t('admin.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditPackageDialog;