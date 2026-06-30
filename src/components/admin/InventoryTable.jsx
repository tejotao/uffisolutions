import React, { useState } from 'react';
import { Package, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditPackageDialog from './EditPackageDialog';
import { calculateBaseFee, calculateStorageFee } from '@/lib/feeCalculations';

function InventoryTable({ packages, clients, onUpdate }) {
  const [selectedPackage, setSelectedPackage] = useState(null);

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
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Cliente/SUITE</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Rastreio</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Peso (kg)</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Taxa Base</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Armazenagem</th>
              <th className="text-right py-3 px-4 text-gray-700 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="text-gray-800 font-medium">{pkg.clientName}</div>
                  <div className="text-gray-600 text-sm">{pkg.suite}</div>
                </td>
                <td className="py-3 px-4 text-gray-700">{pkg.tracking}</td>
                <td className="py-3 px-4 text-gray-700">{pkg.weight} kg</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(pkg.status)}`}>
                    {pkg.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-700">£{pkg.baseFee.toFixed(2)}</td>
                <td className="py-3 px-4 text-gray-700">£{pkg.storageFee.toFixed(2)}</td>
                <td className="py-3 px-4 text-right">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setSelectedPackage(pkg)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPackage && (
        <EditPackageDialog
          package={selectedPackage}
          clients={clients}
          onClose={() => setSelectedPackage(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}

export default InventoryTable;