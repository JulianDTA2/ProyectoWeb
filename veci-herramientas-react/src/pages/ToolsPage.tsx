import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useTools, type Tool } from '../context/ToolsContext';
import { useAuth } from '../context/AuthContext';
import { useLoans } from '../context/LoansContext';
import { Link, useNavigate } from 'react-router-dom';

export default function ToolsPage() {
  const { tools, fetchTools, addTool, loading, error: toolsError, successMessage } = useTools();
  const { user } = useAuth();
  const { createLoan } = useLoans();
  const navigate = useNavigate();

  // --- ESTADOS LOCALES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [isCreating, setIsCreating] = useState(false);
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    category: 'Carpintería',
    type: 'loan' as 'loan' | 'sale', // Tipado explícito para evitar conflictos
    price: 0,
  });

  // Estados del Modal de Solicitud
  const [showModal, setShowModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [loanDates, setLoanDates] = useState({ startDate: '', endDate: '' });
  const [isRequesting, setIsRequesting] = useState(false);

  // Cargar herramientas al montar
  useEffect(() => {
    fetchTools();
  }, []);

  // --- LÓGICA DE FILTRADO ---
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const query = searchQuery.toLowerCase();
      // Verificamos que las propiedades existan para evitar crash si el backend devuelve datos incompletos
      const toolName = tool.name ? tool.name.toLowerCase() : '';
      const toolDesc = tool.description ? tool.description.toLowerCase() : '';
      
      const matchesText = toolName.includes(query) || toolDesc.includes(query);
      const matchesCategory = filterCategory ? tool.category === filterCategory : true;
      const matchesType = filterType === 'all' ? true : tool.type === filterType;

      return matchesText && matchesCategory && matchesType;
    });
  }, [tools, searchQuery, filterCategory, filterType]);

  // --- HANDLERS ---

  const handleSubmitTool = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTool.name || !newTool.category) return;

    setIsCreating(true);
    // Aseguramos que el precio sea 0 si es un préstamo
    const finalPrice = newTool.type === 'sale' ? Number(newTool.price) : 0;

    const success = await addTool({
      ...newTool,
      price: finalPrice,
    });

    if (success) {
      alert('Tu herramienta ha sido enviada para revisión del administrador.');
      setNewTool({
        name: '',
        description: '',
        category: 'Carpintería',
        type: 'loan',
        price: 0,
      });
    }
    setIsCreating(false);
  };

  const handleOpenRequestModal = (tool: Tool) => {
    setSelectedTool(tool);
    setLoanDates({ startDate: '', endDate: '' });
    setShowModal(true);
  };

  const handleRequestLoan = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTool || !loanDates.startDate || !loanDates.endDate) return;

    setIsRequesting(true);
    // Usamos el contexto de Loans para crear la solicitud
    const success = await createLoan(selectedTool.id, loanDates.startDate, loanDates.endDate);
    setIsRequesting(false);

    if (success) {
      alert('Solicitud enviada con éxito');
      setShowModal(false);
    } else {
      alert('Error al solicitar el préstamo');
    }
  };

  const handleBuy = (tool: Tool) => {
    // Redirigir al chat con parámetros para iniciar la compra
    navigate(`/chat?userId=${tool.ownerId}&toolId=${tool.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER DE NAVEGACIÓN */}
        <Link
          to="/dashboard"
          className="mb-6 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span className="mr-1">&larr;</span> Volver al Dashboard
        </Link>

        <h1 className="mb-8 text-4xl font-extrabold text-gray-800 tracking-tight">
          Catálogo de la Comunidad
        </h1>

        {/* --- FORMULARIO PUBLICAR --- */}
        <form
          onSubmit={handleSubmitTool}
          className="mb-10 rounded-xl bg-white p-6 shadow-lg border-t-4 border-blue-500"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-700 flex items-center gap-2">
            Publicar Anuncio
          </h2>

          {/* Feedback Visual */}
          {toolsError && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{toolsError}</div>}
          {successMessage && <div className="mb-4 text-green-600 bg-green-50 p-3 rounded">{successMessage}</div>}

          <div className="grid gap-6 md:grid-cols-2 mb-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">Nombre del objeto</label>
              <input
                type="text"
                required
                value={newTool.name}
                onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="Ej. Taladro Percutor"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">Categoría</label>
              <select
                value={newTool.category}
                onChange={(e) => setNewTool({ ...newTool, category: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                <option>Carpintería</option>
                <option>Jardinería</option>
                <option>Cocina</option>
                <option>Camping</option>
                <option>Electrónica</option>
                <option>Otro</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">Tipo de Publicación</label>
              <select
                value={newTool.type}
                onChange={(e) => setNewTool({ ...newTool, type: e.target.value as 'loan' | 'sale' })}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                <option value="loan">🤝 Préstamo (Gratuito/Intercambio)</option>
                <option value="sale">💰 Venta</option>
              </select>
            </div>

            {newTool.type === 'sale' && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600">Precio ($)</label>
                <input
                  type="number"
                  min="0"
                  value={newTool.price}
                  onChange={(e) => setNewTool({ ...newTool, price: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-600">Descripción</label>
            <textarea
              value={newTool.description}
              onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-200 outline-none"
              placeholder="Estado, accesorios, etc."
              rows={2}
            />
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full md:w-auto md:px-8 rounded-lg bg-blue-600 py-3 text-white font-semibold shadow-md hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {isCreating ? 'Publicando...' : 'Enviar a Revisión'}
          </button>
        </form>

        {/* --- BARRA DE BÚSQUEDA Y FILTROS --- */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row sticky top-4 z-10">
          <input
            type="text"
            placeholder="Buscar herramienta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-xl border border-gray-300 bg-white p-4 shadow-md focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full md:w-1/4 rounded-xl border border-gray-300 bg-white p-4 shadow-md focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
          >
            <option value="">Todas las Categorías</option>
            <option>Carpintería</option>
            <option>Jardinería</option>
            <option>Cocina</option>
            <option>Camping</option>
            <option>Electrónica</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-1/4 rounded-xl border border-gray-300 bg-white p-4 shadow-md focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer font-semibold text-gray-700"
          >
            <option value="all">Todo</option>
            <option value="loan">🤝 Solo Préstamos</option>
            <option value="sale">💰 Solo Ventas</option>
          </select>
        </div>

        {/* --- GRID DE HERRAMIENTAS --- */}
        <div className="rounded-xl bg-white p-8 shadow-lg min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span>🛠️</span> Herramientas Disponibles
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {filteredTools.length} resultados
            </span>
          </div>

          {loading ? (
            <p className="text-center py-12 text-gray-500 animate-pulse">Cargando herramientas...</p>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤷‍♂️</div>
              <p className="text-gray-600 text-lg">No encontramos herramientas con esos filtros.</p>
              <button
                onClick={() => { setSearchQuery(''); setFilterCategory(''); setFilterType('all'); }}
                className="mt-4 text-blue-600 font-semibold hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="group relative rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-800">{tool.name}</h3>

                        {/* Badges */}
                        {tool.type === 'sale' ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold border border-green-200 shadow-sm">
                            VENTA ${tool.price}
                          </span>
                        ) : (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold border border-purple-200 shadow-sm">
                            PRÉSTAMO
                          </span>
                        )}

                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{tool.description}</p>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col items-end gap-3 min-w-[140px]">
                      {user?.userId !== tool.ownerId ? (
                        tool.type === 'sale' ? (
                          <button
                            onClick={() => handleBuy(tool)}
                            className="w-full rounded-lg bg-green-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-green-700 hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                            <span>🛒</span> Comprar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenRequestModal(tool)}
                            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                            <span>📅</span> Solicitar
                          </button>
                        )
                      ) : (
                        <span className="w-full text-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-500 border border-gray-200 cursor-default select-none">
                          Es tuya
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer de la tarjeta */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      👤 Dueño: 
                      {tool.owner ? (
                        <Link 
                          to={`/user/${tool.owner.id}`} 
                          className="font-bold text-gray-700 hover:text-blue-600 hover:underline ml-1"
                        >
                          {tool.owner.name}
                        </Link>
                      ) : (
                        <span className="font-bold text-gray-700 ml-1">...</span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL SOLICITUD --- */}
      {showModal && selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Solicitar Préstamo</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">Herramienta:</p>
              <p className="text-lg font-bold text-blue-900">{selectedTool.name}</p>
            </div>

            <form onSubmit={handleRequestLoan}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Desde</label>
                  <input
                    type="date"
                    required
                    value={loanDates.startDate}
                    onChange={(e) => setLoanDates({ ...loanDates, startDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Hasta</label>
                  <input
                    type="date"
                    required
                    value={loanDates.endDate}
                    onChange={(e) => setLoanDates({ ...loanDates, endDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-gray-100 px-5 py-3 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRequesting}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-white font-bold hover:bg-blue-700 shadow-md transition-all disabled:opacity-70"
                >
                  {isRequesting ? 'Enviando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}