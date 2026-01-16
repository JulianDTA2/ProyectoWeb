import { useState } from 'react';
import { useLoans } from '../context/LoansContext'; // <--- Quitamos "type Loan"

export default function MyLoansPage() {
  const { myRequests, incomingRequests, loading, updateLoanStatus } = useLoans();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800', // Aprobado suele ser azul/preparación
      active: 'bg-green-100 text-green-800',   // Activo es verde (en uso)
      rejected: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800',
    };
    
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      active: 'En Uso', // Etiqueta para active
      rejected: 'Rechazado',
      returned: 'Devuelto',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Mis Préstamos</h1>

      {/* Tabs de Navegación */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === 'sent' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Solicitudes Enviadas
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === 'received' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Solicitudes Recibidas
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Cargando préstamos...</div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'sent' ? (
            // --- TAB 1: LO QUE YO PEDÍ ---
            myRequests.length === 0 ? (
              <p className="text-gray-500">No has solicitado herramientas aún.</p>
            ) : (
              myRequests.map((loan) => (
                <div key={loan.id} className="bg-white p-4 rounded-lg shadow border flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{loan.tool?.name || 'Herramienta'}</h3>
                    <p className="text-sm text-gray-600">
                      Fecha: {new Date(loan.startDate).toLocaleDateString()} - {new Date(loan.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>
              ))
            )
          ) : (
            // --- TAB 2: LO QUE ME PIDIERON ---
            incomingRequests.length === 0 ? (
              <p className="text-gray-500">No tienes solicitudes pendientes.</p>
            ) : (
              incomingRequests.map((loan) => (
                <div key={loan.id} className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{loan.tool?.name}</h3>
                      <p className="text-sm text-gray-600">Solicitado por: {loan.requester?.name || 'Usuario'}</p>
                      <p className="text-xs text-gray-500">
                        Del {new Date(loan.startDate).toLocaleDateString()} al {new Date(loan.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={loan.status} />
                  </div>

                  {/* Acciones para el dueño */}
                  {loan.status === 'pending' && (
                    <div className="flex gap-2 justify-end mt-2 border-t pt-3">
                      <button
                        onClick={() => updateLoanStatus(loan.id, 'rejected')}
                        className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => updateLoanStatus(loan.id, 'approved')}
                        className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                      >
                        Aprobar
                      </button>
                    </div>
                  )}

                  {/* Si ya está aprobado, dar opción de marcar como activo/entregado */}
                  {loan.status === 'approved' && (
                     <div className="flex justify-end mt-2 border-t pt-3 gap-2">
                       <button
                         onClick={() => updateLoanStatus(loan.id, 'active')}
                         className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                       >
                         Entregar Herramienta (Activar)
                       </button>
                     </div>
                  )}

                  {/* Si está activo, dar opción de devolver */}
                  {loan.status === 'active' && (
                     <div className="flex justify-end mt-2 border-t pt-3">
                       <button
                         onClick={() => updateLoanStatus(loan.id, 'returned')}
                         className="px-3 py-1 text-sm text-purple-600 border border-purple-200 rounded hover:bg-purple-50"
                       >
                         Confirmar Devolución
                       </button>
                     </div>
                  )}
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}