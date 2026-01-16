import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToolsProvider } from './context/ToolsContext';
import { LoansProvider } from './context/LoansContext';
import { type ReactNode } from 'react';
import MyLoansPage from './pages/MyLoansPage';

// --- IMPORTACIONES DE PÁGINAS REALES ---
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard'; // Asegúrate de que este archivo exista en src/pages/

// --- COMPONENTES TEMPORALES (Placeholders) ---
// Estos evitan errores mientras creas los archivos reales de cada vista
const Tools = () => <div className="p-10 text-2xl">🛠️ Herramientas (Pendiente)</div>;
const MyLoans = () => <div className="p-10 text-2xl">📅 Mis Préstamos (Pendiente)</div>;
const Admin = () => <div className="p-10 text-2xl">👮 Panel de Admin (Pendiente)</div>;
const Notifications = () => <div className="p-10 text-2xl">🔔 Notificaciones (Pendiente)</div>;
const Chat = () => <div className="p-10 text-2xl">💬 Chat (Pendiente)</div>;
const UnavailableTools = () => <div className="p-10 text-2xl">🚫 Herramientas No Disponibles (Pendiente)</div>;

// Componente placeholder para Perfil de Usuario
const UserProfile = () => {
  const { id } = useParams();
  return <div className="p-10 text-2xl">👤 Perfil del Usuario ID: {id}</div>;
};

// --- DEFINICIÓN DE GUARDS (PROTECCIÓN DE RUTAS) ---

// 1. ProtectedRoute: Si NO está logueado, manda al Login
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 2. PublicRoute: Si YA está logueado, manda al Dashboard (para que no vea el login de nuevo)
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// --- APP PRINCIPAL ---

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToolsProvider>
          <LoansProvider>
            
            <Routes>
              {/* Redirección inicial */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Ruta PÚBLICA (Login) */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />

              {/* Rutas PROTEGIDAS (Requieren Login) */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
              <Route path="/my-loans" element={<ProtectedRoute><MyLoans /></ProtectedRoute>} />
              <Route path="/user/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/unavailable" element={<ProtectedRoute><UnavailableTools /></ProtectedRoute>} />
              <Route path="/my-loans" element={<ProtectedRoute><MyLoansPage /></ProtectedRoute>} />

              {/* Ruta 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

          </LoansProvider>
        </ToolsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;