import React from 'react';
import { MapPin, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

function AddressCard({ suite }) {
  const address = `${suite}\n123 Warehouse Street\nLondon, E1 6AN\nUnited Kingdom`;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Endereço copiado!",
      description: "O endereço foi copiado para a área de transferência",
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-xl border border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-200 p-3 rounded-lg">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-blue-800 font-bold text-lg">Seu Endereço em Londres</h3>
            <p className="text-blue-600 text-sm">Use este endereço para suas compras</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <Copy className="w-4 h-4" />
          Copiar
        </Button>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="mb-3">
          <span className="text-gray-600 text-sm font-medium">Código SUITE:</span>
          <p className="text-blue-800 text-2xl font-bold mt-1">{suite}</p>
        </div>
        <div className="text-gray-700 space-y-1">
          <p className="font-medium">123 Warehouse Street</p>
          <p>London, E1 6AN</p>
          <p>United Kingdom</p>
        </div>
      </div>

      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-yellow-700 text-sm">
          ⚠️ <strong>Importante:</strong> Sempre inclua seu código SUITE em todas as suas compras!
        </p>
      </div>
    </div>
  );
}

export default AddressCard;