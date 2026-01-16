import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Veci-Herramientas
        </h1>

        <h2 className="mb-6 text-center text-xl text-gray-600">
          {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="mb-4">
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                placeholder="Tu Nombre"
              />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Correo</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="tu@correo.com"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-md p-3 text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 
              ${isRegistering ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}
              ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {isLoading ? (isRegistering ? 'Registrando...' : 'Cargando...') : (isRegistering ? 'Crear Cuenta' : 'Entrar')}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-md bg-red-100 p-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            type="button"
            className="cursor-pointer text-sm text-blue-600 hover:underline"
          >
            {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}