import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    api.get('/notifications').then(res => setNotifications(res.data)).catch(console.error);
  }, []);

  const markRead = async (n: any) => {
    if (n.read) return;
    try {
      await api.patch(`/notifications/${n.id}/read`);
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Notificaciones</h1>
          <Link to="/dashboard" className="text-blue-600 hover:underline">Volver</Link>
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden divide-y">
          {notifications.length === 0 ? <div className="p-8 text-center text-gray-500">Sin notificaciones.</div> : (
            notifications.map(n => (
              <div key={n.id} onClick={() => markRead(n)} 
                className={`p-4 flex gap-4 cursor-pointer hover:bg-gray-50 ${!n.read ? 'bg-blue-50' : ''}`}>
                <div className="text-2xl">{n.read ? '📩' : '📫'}</div>
                <div className="flex-1">
                  <p className={`text-gray-800 ${!n.read ? 'font-bold' : ''}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}