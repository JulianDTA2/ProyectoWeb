import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { type ReactNode } from 'react';
import LoginPage from './pages/LoginPage';

// --- COMPONENTES TEMPORALES (Placeholders) ---
// Úsalos mientras vas creando los archivos reales en src/pages/
const Dashboard = () => <div className="p-10 text-2xl">🏠 Dashboard (Ruta Protegida)</div>;
const Tools = () => <div className="p-10 text-2xl">🛠️ Herramientas</div>;
const MyLoans = () => <div className="p-10 text-2xl">📅 Mis Préstamos</div>;
const Admin = () => <div className="p-10 text-2xl">👮 Panel de Admin</div>;
const Notifications = () => <div className="p-10 text-2xl">🔔 Notificaciones</div>;
const Chat = () => <div className="p-10 text-2xl">💬 Chat</div>;
const UnavailableTools = () => <div className="p-10 text-2xl">🚫 Herramientas No Disponibles</div>;

// Ejemplo de cómo leer parámetros de la URL (para /user/:id)
const UserProfile = () => {
  const { id } = useParams();
  return <div className="p-10 text-2xl">👤 Perfil del Usuario ID: {id}</div>;
};

// --- GUARDS (PROTECCIÓN DE RUTAS) ---

// 1. ProtectedRoute: Equivalente a meta: { requiresAuth: true }
// Si NO está logueado -> Lo manda al Login.
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Cargando sesión...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 2. PublicRoute: Equivalente a meta: { guest: true }
// Si YA está logueado -> Lo manda al Dashboard (no le deja ver el login).
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// --- CONFIGURACIÓN DE RUTAS ---

function App() {
  return (
    <BrowserRouter>
      {/* El AuthProvider debe envolver las rutas para dar acceso al usuario/token */}
      <AuthProvider>
        <Routes>
          {/* Redirección inicial: "/" -> "/dashboard" */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* RUTA PÚBLICA (Solo invitados) */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />

          {/* RUTAS PROTEGIDAS (Requieren Login) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
          <Route path="/my-loans" element={<ProtectedRoute><MyLoans /></ProtectedRoute>} />
          <Route path="/user/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/unavailable" element={<ProtectedRoute><UnavailableTools /></ProtectedRoute>} />

          {/* CUALQUIER OTRA RUTA (404) -> Redirigir al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;