import { useAuth } from '../context/AuthContext';
import { useTools } from '../context/ToolsContext';
import { useLoans } from '../context/LoansContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { tools, loading: loadingTools } = useTools();
  const { loans, loading: loadingLoans } = useLoans();

  // Cálculos simples (equivalentes a computed en Vue)
  const activeLoans = loans.filter(l => l.status === 'active').length;
  const availableTools = tools.filter(t => t.status === 'available').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header simple */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hola, {user?.name} 👋</h1>
          <p className="text-gray-600">Bienvenido a Veci-Herramientas</p>
        </div>
        <div className="text-right">
          <Link to="/tools" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Ver Herramientas
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-500">Mis Préstamos Activos</h3>
          <p className="mt-2 text-4xl font-bold text-blue-600">
            {loadingLoans ? '...' : activeLoans}
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-500">Herramientas Disponibles</h3>
          <p className="mt-2 text-4xl font-bold text-green-600">
            {loadingTools ? '...' : availableTools}
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-500">Mi Rol</h3>
          <p className="mt-2 text-xl font-bold text-purple-600 capitalize">
            {user?.role || 'Usuario'}
          </p>
        </div>
      </div>

      {/* Lista rápida de herramientas recientes */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-800">Herramientas Recientes</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.slice(0, 4).map((tool) => (
            <div key={tool.id} className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md">
              <div className="h-32 w-full bg-gray-200 object-cover">
                {/* Placeholder para imagen */}
                {tool.image ? (
                  <img src={tool.image} alt={tool.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">Sin imagen</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800">{tool.name}</h3>
                <p className="text-sm text-gray-600">${tool.price}/día</p>
                <span className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold 
                  ${tool.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {tool.status === 'available' ? 'Disponible' : 'No disponible'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}