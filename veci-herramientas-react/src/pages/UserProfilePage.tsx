import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, rRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/reviews/user/${id}`)
        ]);
        setProfileUser(uRes.data);
        setReviews(rRes.data);
      } catch (e) {
        alert('Usuario no encontrado');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const rating = useMemo(() => {
    if (!reviews.length) return 0;
    return (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  if (loading) return <div className="text-center mt-10">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 font-medium">&larr; Volver</button>
        
        <div className="mb-8 rounded-xl bg-white shadow overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold">
              {profileUser.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-bold">{profileUser.name}</h1>
              <p className="opacity-90">Miembro de la comunidad</p>
            </div>
          </div>
          <div className="p-6 border-b flex items-center gap-2">
            <span className="font-bold text-gray-700">Reputación:</span>
            <span className="text-yellow-500 text-xl">★ {rating}</span>
            <span className="text-gray-400 text-sm">({reviews.length} reseñas)</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Reseñas */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Lo que dicen sus vecinos</h2>
            {reviews.length === 0 ? <p className="text-gray-500 bg-white p-4 rounded">Sin reseñas aún.</p> : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white p-4 rounded shadow-sm border">
                    <div className="flex justify-between font-bold text-gray-700">
                      <span>{r.reviewer?.name || 'Anónimo'}</span>
                      <span className="text-yellow-400">{'★'.repeat(r.rating)}</span>
                    </div>
                    <p className="text-gray-600 italic">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Catálogo */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Su Catálogo</h2>
            <div className="space-y-4">
              {profileUser.tools?.map((t: any) => (
                <div key={t.id} className="bg-white p-4 rounded shadow-sm flex justify-between">
                  <span className="font-bold">{t.name}</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">{t.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}