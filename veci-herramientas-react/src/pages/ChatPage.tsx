import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Contexto de venta
  const currentToolId = searchParams.get('toolId');
  const targetUserId = searchParams.get('userId');
  const [currentTool, setCurrentTool] = useState<any>(null);

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(() => {
      fetchContacts();
      if (activeChat) fetchMessages(activeChat.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeChat]);

  // Inicialización (si vengo de "Comprar")
  useEffect(() => {
    const init = async () => {
      if (currentToolId) {
        try {
          const res = await api.get(`/tools/${currentToolId}`);
          setCurrentTool(res.data);
        } catch (e) { console.error(e); }
      }
      if (targetUserId) {
        try {
          const res = await api.get(`/users/${targetUserId}`);
          setActiveChat(res.data); // Establecer chat activo temporalmente
        } catch (e) { console.error(e); }
      }
    };
    init();
  }, [currentToolId, targetUserId]);

  useEffect(() => {
    if (activeChat) fetchMessages(activeChat.id);
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/messages/contacts');
      setContacts(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      const res = await api.get(`/messages/conversation/${contactId}`);
      setMessages(res.data);
    } catch (e) { console.error(e); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    
    try {
      await api.post('/messages', { receiverId: activeChat.id, content: newMessage });
      setMessages([...messages, { 
        id: Date.now(), content: newMessage, senderId: user?.userId, createdAt: new Date().toISOString() 
      }]);
      setNewMessage('');
    } catch (e) { console.error(e); }
  };

  const markAsSold = async () => {
    if (!currentToolId || !window.confirm('¿Confirmas que has vendido esta herramienta?')) return;
    try {
      await api.patch(`/tools/${currentToolId}/sell`);
      await api.post('/messages', { 
        receiverId: activeChat.id, 
        content: `✅ He marcado "${currentTool?.name}" como VENDIDO. ¡Gracias!` 
      });
      alert('Venta registrada');
      navigate('/dashboard');
    } catch (e) { alert('Error al registrar venta'); }
  };

  return (
    <div className="h-screen bg-gray-100 p-4 flex flex-col">
       <Link to="/dashboard" className="mb-3 w-fit bg-white px-4 py-2 rounded-lg text-blue-600 font-medium shadow-sm">
         &larr; Volver al Dashboard
       </Link>

       <div className="flex-1 flex gap-4 overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
         {/* Sidebar */}
         <div className="w-1/3 border-r bg-gray-50 flex flex-col min-w-[250px]">
           <div className="p-4 border-b font-bold text-gray-700">Mensajes ({contacts.length})</div>
           <div className="flex-1 overflow-y-auto">
             {contacts.map(contact => (
               <div key={contact.id} onClick={() => setActiveChat(contact)}
                 className={`p-4 border-b cursor-pointer hover:bg-blue-50 flex items-center gap-3 ${activeChat?.id === contact.id ? 'bg-blue-100' : ''}`}>
                 <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                   {contact.name.charAt(0)}
                 </div>
                 <div>
                   <p className="font-semibold">{contact.name}</p>
                   <p className="text-xs text-gray-500 truncate">{contact.lastMessage}</p>
                 </div>
               </div>
             ))}
           </div>
         </div>

         {/* Chat Area */}
         <div className="flex-1 flex flex-col">
           {activeChat ? (
             <>
               <div className="p-4 border-b flex justify-between items-center shadow-sm z-10">
                 <h2 className="font-bold text-lg">{activeChat.name}</h2>
                 {currentTool && currentTool.ownerId === user?.userId && (
                   <button onClick={markAsSold} className="bg-green-600 text-white px-3 py-1 rounded shadow-sm hover:bg-green-700 text-sm">
                     💰 Marcar como Vendido
                   </button>
                 )}
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
                 {messages.map(msg => (
                   <div key={msg.id} className={`flex ${msg.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${msg.senderId === user?.userId ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                       {msg.content}
                     </div>
                   </div>
                 ))}
                 <div ref={messagesEndRef} />
               </div>

               <form onSubmit={sendMessage} className="p-4 border-t bg-white flex gap-2">
                 <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                   className="flex-1 border rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Escribe un mensaje..." />
                 <button type="submit" className="bg-blue-600 text-white rounded-full w-10 h-10 hover:bg-blue-700">➤</button>
               </form>
             </>
           ) : (
             <div className="flex-1 flex items-center justify-center text-gray-400">Selecciona un chat</div>
           )}
         </div>
       </div>
    </div>
  );
}