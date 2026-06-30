import React from 'react';
import { Package, Calendar, Weight, FileText, CreditCard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PackageCard({ package: pkg, onRequestShipping, onPayInvoice }) {
  const getStatusColor = (status) => {
    const colors = {
      'Recebido': 'bg-blue-100 text-blue-700 border-blue-200',
      'Em Espera': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Aguardando Pagamento': 'bg-orange-100 text-orange-700 border-orange-200',
      'Pago': 'bg-green-100 text-green-700 border-green-200',
      'Enviado': 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-gray-800 font-bold">{pkg.tracking}</h3>
            <p className="text-gray-600 text-sm">{pkg.items}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(pkg.status)}`}>
          {pkg.status}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Weight className="w-4 h-4" />
          <span className="text-sm">Peso: {pkg.weight} kg</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Recebido: {new Date(pkg.receivedDate).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      {pkg.photoUrl && (
        <div className="mb-4">
          <img src={pkg.photoUrl} alt="Foto do pacote" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
        </div>
      )}

      {pkg.status === 'Aguardando Pagamento' && pkg.totalInvoice && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-orange-700" />
            <span className="text-orange-700 font-semibold">Fatura Pendente</span>
          </div>
          <div className="text-orange-800 text-2xl font-bold">£{pkg.totalInvoice.toFixed(2)}</div>
          <Button
            onClick={() => onPayInvoice(pkg.id)}
            className="w-full mt-3 bg-orange-600 hover:bg-orange-700 border-orange-600 text-white"
          >
            <CreditCard className="w-4 h-4" />
            Pagar Fatura
          </Button>
        </div>
      )}

      {pkg.status === 'Enviado' && pkg.finalTracking && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-purple-700" />
            <span className="text-purple-700 font-semibold">Rastreamento Final</span>
          </div>
          <div className="text-purple-800 font-mono">{pkg.finalTracking}</div>
        </div>
      )}

      {pkg.status === 'Recebido' && (
        <Button
          onClick={() => onRequestShipping(pkg.id)}
          className="w-full"
        >
          Solicitar Envio
        </Button>
      )}
    </div>
  );
}

export default PackageCard;