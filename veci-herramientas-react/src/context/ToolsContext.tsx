import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

// Interfaces basadas en tu backend (entities)
export interface Tool {
  id: string; // O number, según tu backend
  name: string;
  description: string;
  price: number;
  status: 'available' | 'borrowed' | 'maintenance';
  image?: string;
  ownerId?: string;
}

interface ToolsContextType {
  tools: Tool[];
  loading: boolean;
  error: string | null;
  fetchTools: () => Promise<void>;
  addTool: (toolData: Omit<Tool, 'id' | 'status'>) => Promise<boolean>;
  updateTool: (id: string, toolData: Partial<Tool>) => Promise<boolean>;
  deleteTool: (id: string) => Promise<boolean>;
}

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

export const ToolsProvider = ({ children }: { children: ReactNode }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); // Necesitamos el token para hacer peticiones

  const fetchTools = async () => {
    setLoading(true);
    try {
      const response = await api.get<Tool[]>('/tools');
      setTools(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar herramientas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar herramientas automáticamente cuando hay token
  useEffect(() => {
    if (token) fetchTools();
  }, [token]);

  const addTool = async (toolData: Omit<Tool, 'id' | 'status'>) => {
    try {
      const response = await api.post('/tools', toolData);
      setTools([...tools, response.data]); // Actualizar estado local
      return true;
    } catch (err) {
      setError('Error al crear herramienta');
      return false;
    }
  };

  const updateTool = async (id: string, toolData: Partial<Tool>) => {
    try {
      const response = await api.patch(`/tools/${id}`, toolData);
      // Actualizamos la herramienta específica en el array
      setTools(tools.map(t => t.id === id ? { ...t, ...response.data } : t));
      return true;
    } catch (err) {
      setError('Error al actualizar herramienta');
      return false;
    }
  };

  const deleteTool = async (id: string) => {
    try {
      await api.delete(`/tools/${id}`);
      setTools(tools.filter(t => t.id !== id));
      return true;
    } catch (err) {
      setError('Error al eliminar herramienta');
      return false;
    }
  };

  return (
    <ToolsContext.Provider value={{ tools, loading, error, fetchTools, addTool, updateTool, deleteTool }}>
      {children}
    </ToolsContext.Provider>
  );
};

export const useTools = () => {
  const context = useContext(ToolsContext);
  if (!context) throw new Error('useTools debe usarse dentro de un ToolsProvider');
  return context;
};