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
    // FONDO: Un tono gris/azulado claro típico del estilo, con fuente sans
    <div className="min-h-screen bg-[#E0E7FF] p-6 md:p-10 font-sans">
      <div className="mx-auto max-w-6xl">
        
        {/* --- HEADER --- */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between rounded-xl border-2 border-black bg-white p-6 shadow-neo">
          
          {/* Bienvenida */}
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tight text-black sm:text-5xl">
              Hola, {user?.name?.split(' ')[0] || 'Vecino'}! 👋
            </h1>
            <p className="mt-2 text-lg font-bold text-gray-700">
              Bienvenido a tu comunidad de herramientas.
            </p>
          </div>

          {/* Botones de Acción Rápida (Top Right) */}
          <div className="flex flex-wrap gap-3">
            <Link 
              to="/notifications" 
              className="flex items-center gap-2 rounded-md border-2 border-black bg-[#FFDE00] px-4 py-2 font-bold text-black shadow-neo transition-all hover:-translate-y-1 hover:shadow-neo-lg active:translate-y-0 active:shadow-none"
            >
              🔔 <span className="hidden sm:inline">Notificaciones</span>
            </Link>

            <Link 
              to="/chat" 
              className="flex items-center gap-2 rounded-md border-2 border-black bg-[#FF90E8] px-4 py-2 font-bold text-black shadow-neo transition-all hover:-translate-y-1 hover:shadow-neo-lg active:translate-y-0 active:shadow-none"
            >
              💬 <span className="hidden sm:inline">Mensajes</span>
            </Link>

            {/* Botón Admin (Solo si es admin) */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 rounded-md border-2 border-black bg-[#7e22ce] px-4 py-2 font-bold text-white shadow-neo transition-all hover:-translate-y-1 hover:shadow-neo-lg active:translate-y-0 active:shadow-none"
              >
                🛡️ <span className="hidden sm:inline">Admin Panel</span>
              </Link>
            )}
          </div>
        </div>

        {/* --- GRID DE NAVEGACIÓN PRINCIPAL --- */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* TARJETA 1: CATÁLOGO */}
          <Link 
            to="/tools" 
            className="group relative overflow-hidden rounded-xl border-2 border-black bg-[#23A0FF] p-8 shadow-neo transition-all hover:-translate-y-1 hover:shadow-neo-lg"
          >
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-white text-4xl shadow-sm">
                🛠️
              </div>
              <h2 className="mb-1 text-2xl font-black uppercase text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                Catálogo
              </h2>
              <p className="font-bold text-white opacity-90">
                Explora, compra o pide prestado.
              </p>
            </div>
            {/* Elemento decorativo de fondo */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full border-2 border-black bg-white opacity-20 transition-transform group-hover:scale-150"></div>
          </Link>

          {/* TARJETA 2: MIS PRÉSTAMOS */}
          <Link 
            to="/my-loans" 
            className="group relative overflow-hidden rounded-xl border-2 border-black bg-[#00F0FF] p-8 shadow-neo transition-all hover:-translate-y-1 hover:shadow-neo-lg"
          >
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-white text-4xl shadow-sm">
                🤝
              </div>
              <h2 className="mb-1 text-2xl font-black uppercase text-black">
                Mis Préstamos
              </h2>
              <p className="font-bold text-gray-800">
                Tus solicitudes enviadas y recibidas.
              </p>
            </div>
          </Link>

          {/* TARJETA 3: MI PERFIL */}
          {user && (
            <Link 
              to={`/user/${user.userId}`} 
              className="group relative overflow-hidden rounded-xl border-2 border-black bg-[#FFDE00] p-8 shadow-neo transition-all hover:-translate-y-1 hover:shadow-neo-lg"
            >
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-white text-4xl shadow-sm">
                  👤
                </div>
                <h2 className="mb-1 text-2xl font-black uppercase text-black">
                  Mi Perfil
                </h2>
                <p className="font-bold text-gray-800">
                  Tu reputación y herramientas.
                </p>
              </div>
            </Link>
          )}

          {/* TARJETA 4: HISTORIAL / NO DISPONIBLES (Ocupa ancho completo en móviles, o una celda en grid grande) */}
          <Link 
            to="/unavailable" 
            className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-black bg-white p-8 text-center shadow-neo transition-all hover:-translate-y-1 hover:shadow-neo-lg sm:col-span-2 lg:col-span-3"
          >
            <div className="mb-2 text-4xl transition-transform group-hover:scale-110">🚫</div>
            <h2 className="text-xl font-black uppercase text-gray-800">
              Historial / No Disponibles
            </h2>
            <p className="text-sm font-bold text-gray-500">
              Consulta herramientas que ya han sido vendidas o están prestadas actualmente.
            </p>
          </Link>

        </div>

        {/* --- LOGOUT --- */}
        <div className="mt-12 text-center">
          <button 
            onClick={handleLogout} 
            className="inline-block rounded-lg border-2 border-black bg-red-500 px-8 py-3 font-black uppercase text-white shadow-neo transition-all hover:bg-red-600 hover:shadow-neo-lg active:translate-y-1 active:shadow-none"
          >
            Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  );
}