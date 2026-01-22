import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios'; // Usamos api directo si no está en el context

export default function UnavailableToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Asumiendo que existe este endpoint basado en tu Vue original
    api.get('/tools/unavailable').then(res => setTools(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Herramientas No Disponibles</h1>
          <Link to="/dashboard" className="text-blue-600 hover:underline">Volver</Link>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 grid gap-6 md:grid-cols-2">
          {loading ? <p>Cargando...</p> : tools.map(tool => (
            <div key={tool.id} className="border p-4 rounded bg-gray-50 opacity-75">
              <div className="flex justify-between">
                <h3 className="font-bold text-gray-700">{tool.name}</h3>
                <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${tool.type === 'sale' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                  {tool.type === 'sale' ? 'Vendida' : 'Prestada'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
              <p className="text-xs text-gray-400 mt-2">Dueño: {tool.owner?.name}</p>
            </div>
          ))}
          {!loading && tools.length === 0 && <p className="text-gray-400 col-span-2 text-center">No hay herramientas ocupadas.</p>}
        </div>
      </div>
    </div>
  );
}