import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingTools, setPendingTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchPending();
  }, [user]);

  const fetchPending = async () => {
    try {
      const res = await api.get('/tools/pending');
      setPendingTools(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const decideTool = async (id: string, status: 'approved' | 'rejected') => {
    if (!window.confirm(`¿Confirmar acción: ${status}?`)) return;
    try {
      await api.patch(`/tools/${id}/status`, { status });
      setPendingTools(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert('Error al actualizar estado');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
          <Link to="/dashboard" className="text-blue-600 hover:underline">Volver</Link>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 bg-gray-50 border-b"><h2 className="text-xl font-bold">Solicitudes ({pendingTools.length})</h2></div>
          
          {loading ? <div className="p-8 text-center">Cargando...</div> : (
            pendingTools.length === 0 ? <div className="p-12 text-center text-gray-500">Todo al día. ✅</div> : (
              <div className="divide-y">
                {pendingTools.map(tool => (
                  <div key={tool.id} className="p-6 hover:bg-gray-50 flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg">{tool.name}</h3>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">{tool.category}</span>
                      <p className="text-gray-600 my-2">{tool.description}</p>
                      <p className="text-sm text-gray-500">👤 {tool.owner?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => decideTool(tool.id, 'approved')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Aprobar</button>
                      <button onClick={() => decideTool(tool.id, 'rejected')} className="border border-red-200 text-red-500 px-4 py-2 rounded hover:bg-red-50">Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}