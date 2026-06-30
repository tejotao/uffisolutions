import React from 'react';
import { User, Mail, Phone, Calendar } from 'lucide-react';

function ClientsTable({ clients }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Nome</th>
            <th className="text-left py-3 px-4 text-gray-700 font-semibold">SUITE</th>
            <th className="text-left py-3 px-4 text-gray-700 font-semibold">E-mail</th>
            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Telefone</th>
            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Cadastro</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-800 font-medium">{client.name}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                  {client.suite}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4" />
                  {client.email}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4" />
                  {client.phone}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  {new Date(client.created_at).toLocaleDateString('pt-BR')}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientsTable;