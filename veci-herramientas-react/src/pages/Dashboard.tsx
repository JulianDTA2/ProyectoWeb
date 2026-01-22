import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        
        {/* HEADER DE BIENVENIDA */}
        <div className="mb-8 rounded-xl bg-white p-8 shadow-lg border-l-8 border-blue-600 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Hola, {user?.name || 'Vecino'}!
            </h1>
            <p className="mt-2 text-gray-600">Bienvenido a tu comunidad de herramientas.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {/* BOTÓN NOTIFICACIONES */}
            <Link 
              to="/notifications" 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
            >
              <span>🔔</span> Notificaciones
            </Link>

            {/* BOTÓN MENSAJES */}
            <Link 
              to="/chat" 
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
            >
              <span>💬</span> Mensajes
            </Link>

            {/* BOTÓN ADMIN (Condicional) */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="bg-gray-700 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition shadow-lg"
              >
                <span>🛡️</span> Panel Admin
              </Link>
            )}
          </div>
        </div>

        {/* GRID DE ACCIONES PRINCIPALES */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          
          {/* TARJETA 1: CATÁLOGO */}
          <Link 
            to="/tools" 
            className="group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition border border-transparent hover:border-blue-100 flex flex-col items-center text-center"
          >
            <div className="mb-4 bg-blue-50 p-4 rounded-full text-4xl group-hover:bg-blue-100 transition">
              🛠️
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Catálogo</h2>
            <p className="text-sm text-gray-500">Compra, vende o presta herramientas en tu zona.</p>
          </Link>

          {/* TARJETA 2: MIS PRÉSTAMOS */}
          <Link 
            to="/my-loans" 
            className="group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition border border-transparent hover:border-purple-100 flex flex-col items-center text-center"
          >
            <div className="mb-4 bg-purple-50 p-4 rounded-full text-4xl group-hover:bg-purple-100 transition">
              🤝
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Mis Préstamos</h2>
            <p className="text-sm text-gray-500">Gestiona tus solicitudes enviadas y recibidas.</p>
          </Link>

          {/* TARJETA 3: MI PERFIL */}
          {user && (
            <Link 
              to={`/user/${user.userId}`} 
              className="group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition border border-transparent hover:border-yellow-100 flex flex-col items-center text-center"
            >
              <div className="mb-4 bg-yellow-50 p-4 rounded-full text-4xl group-hover:bg-yellow-100 transition">
                👤
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Mi Perfil</h2>
              <p className="text-sm text-gray-500">Revisa tu reputación y herramientas públicas.</p>
            </Link>
          )}

          {/* TARJETA 4: HISTORIAL / NO DISPONIBLES */}
          <Link 
            to="/unavailable" 
            className="group bg-white p-8 rounded-xl shadow hover:shadow-xl transition text-center border border-transparent hover:border-gray-300 md:col-span-3 lg:col-span-1"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition">
              🚫
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Historial</h2>
            <p className="text-sm text-gray-500">Ver herramientas vendidas o prestadas.</p>
          </Link>
        </div>

        {/* LOGOUT */}
        <div className="text-center">
          <button 
            onClick={handleLogout} 
            className="text-red-500 font-medium hover:underline hover:text-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  );
}