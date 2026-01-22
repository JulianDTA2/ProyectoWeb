import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Importamos los iconos de Lucide para el diseño
import { KeyRound, Mail, User, ArrowRight, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  // --- TU LÓGICA EXACTA (INICIO) ---
  const { login, register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    if (isRegistering && !formData.name) return;

    setIsLoading(true);
    let success = false;

    if (isRegistering) {
      success = await register(formData);
    } else {
      success = await login({ email: formData.email, password: formData.password });
    }

    setIsLoading(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    clearError();
    setFormData({ name: '', email: '', password: '' });
  };
  // --- TU LÓGICA EXACTA (FIN) ---

  // --- DISEÑO NEUBRUTALISTA (JSX) ---
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FF90E8] p-6 font-sans">
      
      {/* CONTENEDOR PRINCIPAL: Borde grueso, sombra dura, sin curvas */}
      <div className="relative w-full max-w-md bg-white p-8 md:p-12 border-4 border-black shadow-neo">
        
        {/* ELEMENTO DECORATIVO (Badge) */}
        <div className="absolute -top-6 -right-6 bg-[#FFDE00] border-4 border-black p-3 shadow-neo-sm transform rotate-3 z-10 hidden sm:block">
          <div className="flex items-center gap-2">
            <ShieldCheck strokeWidth={3} className="w-5 h-5 text-black" />
            <span className="font-black uppercase text-xs tracking-widest text-black">
              Veci App
            </span>
          </div>
        </div>

        {/* HEADER: Títulos grandes y agresivos */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black uppercase italic text-black leading-none mb-3">
            Veci-Herramientas
          </h1>
          <div className="inline-block bg-black text-white px-4 py-1 text-sm font-black uppercase tracking-wider border-2 border-transparent">
            {isRegistering ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}
          </div>
        </div>

        {/* ERROR: Estilo alerta industrial */}
        {error && (
          <div className="mb-8 flex items-center gap-4 bg-[#FF4545] p-4 text-white border-4 border-black shadow-neo-sm animate-pulse">
            <AlertTriangle strokeWidth={4} className="w-8 h-8 flex-shrink-0" />
            <span className="font-black uppercase tracking-wide text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* CAMPO NOMBRE (Solo Registro) */}
          {isRegistering && (
            <div className="group animate-in fade-in slide-in-from-top-4 duration-300">
              <label htmlFor="name" className="mb-2 block text-sm font-black uppercase tracking-widest text-black">
                Nombre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <User strokeWidth={3} className="h-6 w-6 text-black" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-4 pl-12 border-4 border-black rounded-none bg-gray-50 text-black font-bold placeholder-gray-400 focus:outline-none focus:bg-white focus:shadow-neo transition-all"
                  placeholder="TU NOMBRE"
                  required
                />
              </div>
            </div>
          )}

          {/* CAMPO EMAIL */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-black uppercase tracking-widest text-black">
              Correo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Mail strokeWidth={3} className="h-6 w-6 text-black" />
              </div>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-4 pl-12 border-4 border-black rounded-none bg-gray-50 text-black font-bold placeholder-gray-400 focus:outline-none focus:bg-white focus:shadow-neo transition-all"
                placeholder="TU@CORREO.COM"
                required
              />
            </div>
          </div>

          {/* CAMPO PASSWORD */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-black uppercase tracking-widest text-black">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <KeyRound strokeWidth={3} className="h-6 w-6 text-black" />
              </div>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-4 pl-12 border-4 border-black rounded-none bg-gray-50 text-black font-bold placeholder-gray-400 focus:outline-none focus:bg-white focus:shadow-neo transition-all"
                placeholder="********"
                required
              />
            </div>
          </div>

          {/* BOTÓN SUBMIT: Grande, interactivo */}
          <button
            type="submit"
            disabled={isLoading}
            className={`group w-full flex items-center justify-center gap-3 p-4 border-4 border-black shadow-neo text-white font-black uppercase tracking-wider text-lg hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo-hover active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed
              ${isRegistering ? 'bg-[#00F0FF] text-black hover:bg-[#4CFFFF]' : 'bg-[#23A0FF] hover:bg-[#40AFFF]'}`}
          >
            {isLoading ? (
                <>
                    <RefreshCw className="animate-spin w-6 h-6" strokeWidth={3} />
                    {isRegistering ? 'REGISTRANDO...' : 'CARGANDO...'}
                </>
            ) : (
                <>
                    {isRegistering ? 'CREAR CUENTA' : 'ENTRAR'}
                    <ArrowRight strokeWidth={4} className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
            )}
          </button>
        </form>

        {/* FOOTER: Botón Toggle llamativo */}
        <div className="mt-10 text-center border-t-4 border-black pt-6">
          <button
            onClick={toggleMode}
            type="button"
            className="w-full sm:w-auto text-black bg-[#FFDE00] px-6 py-3 font-black uppercase text-sm border-4 border-black shadow-neo-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all"
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

      </div>
    </div>
  );
}