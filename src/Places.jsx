import React, { useState, useEffect } from 'react';
import api from './api';

function Places({ user }) {
  const [places, setPlaces] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', desc: '', date: '', files: [] });

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [isViewing, setIsViewing] = useState(false);

  const fetchPlaces = async () => {
    try {
      const res = await api.get('/api/places');
      const sorted = res.data.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      setPlaces(sorted);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPlaces(); }, []);

  const openAlbum = async (place) => {
    setSelectedPlace(place);
    setIsViewing(true);
    setAlbumPhotos([]); 
    try {
      const res = await api.get(`/api/places/${place.id}/photos`);
      setAlbumPhotos(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Xóa kỷ niệm này khỏi bản đồ kho báu? 🏴‍☠️")) return;
    try {
      await api.delete(`/api/places/${id}`);
      fetchPlaces();
    } catch (err) { alert("Lỗi khi xóa!"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.desc);
    data.append('event_date', formData.date);
    formData.files.forEach(file => data.append('images', file));
    
    try {
      await api.post('/api/places', data);
      setShowForm(false);
      setFormData({ title: '', desc: '', date: '', files: [] });
      fetchPlaces();
    } catch (err) { alert("Lỗi lưu!"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fffafa] pb-24 md:pb-20 animate-fadeIn">
      {/* HEADER */}
      <div className="py-10 md:py-16 text-center px-4">
        <h2 className="text-3xl md:text-5xl font-black text-pink-500 tracking-tighter mb-4 uppercase">MAP KHO BÁU ❤️</h2>
        <div className="w-20 md:w-24 h-1.5 bg-pink-200 mx-auto rounded-full"></div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowForm(true)} className="mt-6 md:mt-8 px-6 py-3 md:px-8 md:py-3 bg-pink-500 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all text-sm md:text-base">
            + Cắm mốc mới ⚓
          </button>
        )}
      </div>

      <div className="relative max-w-5xl mx-auto px-4 md:px-6">
        {/* Đường nối - Mobile: Căn trái | Desktop: Căn giữa */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 border-l-4 border-dashed border-pink-200 -translate-x-1/2 z-0"></div>

        <div className="space-y-16 md:space-y-32">
          {places.map((p, index) => (
            <div 
              key={p.id} 
              className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              
              {/* Card Ảnh (Hòn đảo) */}
              <div 
                onClick={() => openAlbum(p)} 
                className="w-full md:w-1/2 pl-12 md:pl-0 relative group cursor-pointer"
              >
                <div className="p-2 md:p-4 bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl border-2 md:border-4 border-white transition-all group-hover:rotate-1 active:scale-95">
                  <img src={p.cover_image} className="w-full h-48 md:h-72 object-cover rounded-2xl md:rounded-[2rem]" alt="" />
                  
                  {user?.role === 'admin' && (
                    <button 
                      onClick={(e) => handleDelete(e, p.id)}
                      className="absolute top-4 right-4 md:top-8 md:right-8 w-8 h-8 md:w-10 md:h-10 bg-red-500/90 text-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      🗑️
                    </button>
                  )}

                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 md:px-6 md:py-2 rounded-full shadow-md border border-pink-100 whitespace-nowrap">
                    <span className="text-pink-500 font-black text-[10px] md:text-sm uppercase">Chặng {index + 1}</span>
                  </div>
                </div>
              </div>

              {/* Marker 📍 (Mobile: Luôn ở bên trái đường dashed | Desktop: Ở giữa) */}
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-10 h-10 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center border-4 border-pink-400 shadow-xl z-10 shrink-0">
                 <span className="text-xl md:text-2xl">📍</span>
              </div>

              {/* Thông tin */}
              <div className="w-full md:w-1/2 pl-12 md:pl-0 text-left">
                <p className="text-pink-400 font-bold text-xs md:text-sm mb-1 uppercase tracking-widest italic">
                  {new Date(p.event_date).toLocaleDateString('vi-VN')}
                </p>
                <h3 className="text-xl md:text-3xl font-black text-gray-800 mb-2 md:mb-4 leading-tight">{p.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm md:text-lg italic">"{p.description}"</p>
                <button onClick={() => openAlbum(p)} className="mt-4 text-pink-500 font-black flex items-center gap-2 hover:gap-4 transition-all text-xs md:text-base">
                  XEM KHO BÁU 💎 <span>→</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* MODAL XEM ALBUM (Responsive) */}
      {isViewing && selectedPlace && (
        <div className="fixed inset-0 z-[2000] bg-white md:bg-white/95 backdrop-blur-xl overflow-y-auto animate-fadeIn flex flex-col">
          <button 
            onClick={() => setIsViewing(false)} 
            className="fixed top-4 right-4 md:top-8 md:right-8 w-10 h-10 bg-pink-500 text-white md:bg-transparent md:text-pink-500 rounded-full flex items-center justify-center text-2xl font-bold z-[2001] shadow-lg md:shadow-none"
          >
            ✕
          </button>
          
          <div className="max-w-6xl mx-auto py-12 md:py-20 px-4 md:px-6">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-4 tracking-tighter uppercase leading-tight">{selectedPlace.title}</h2>
              <p className="text-pink-400 font-bold text-sm md:text-lg italic bg-pink-50 inline-block px-4 py-1 md:px-6 md:py-2 rounded-full">"{selectedPlace.description}"</p>
            </div>
            
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
              {albumPhotos.length > 0 ? albumPhotos.map((img) => (
                <img key={img.id} src={img.image_url} className="w-full rounded-2xl md:rounded-[2rem] border-2 md:border-4 border-white shadow-lg animate-popIn block" alt="memory" loading="lazy" />
              )) : (
                <p className="col-span-full text-center text-gray-300 italic py-20">Đang tìm kho báu...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FORM THÊM - Bottom Sheet cho Mobile */}
      {showForm && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white w-full md:max-w-md rounded-t-[2.5rem] md:rounded-[3rem] p-8 md:p-10 shadow-2xl border-t-4 md:border-8 border-pink-50 animate-popIn"
          >
            <h3 className="text-xl md:text-3xl font-black text-center mb-6 md:mb-8 text-gray-800">CẮM MỐC TỌA ĐỘ ⚓</h3>
            <div className="space-y-3 md:space-y-4">
              <input type="text" placeholder="Địa điểm..." required className="w-full p-4 rounded-xl md:rounded-2xl bg-pink-50/50 border-2 border-pink-100 outline-none focus:border-pink-400 text-sm md:text-base" onChange={e => setFormData({...formData, title: e.target.value})} />
              <textarea placeholder="Ghi chú..." className="w-full p-4 rounded-xl md:rounded-2xl bg-pink-50/50 border-2 border-pink-100 outline-none text-sm md:text-base" rows="2 md:3" onChange={e => setFormData({...formData, desc: e.target.value})} />
              <input type="date" required className="w-full p-4 rounded-xl md:rounded-2xl bg-pink-50/50 border-2 border-pink-100 outline-none text-sm md:text-base" onChange={e => setFormData({...formData, date: e.target.value})} />
              <label className="flex flex-col items-center justify-center p-6 md:p-8 bg-pink-50 rounded-2xl md:rounded-3xl border-2 border-dashed border-pink-200 cursor-pointer">
                <span className="text-2xl">📸</span>
                <span className="text-pink-600 font-bold mt-2 text-xs md:text-sm">{formData.files.length > 0 ? `Đã chọn ${formData.files.length} ảnh` : "Chọn ảnh kỷ niệm"}</span>
                <input type="file" multiple hidden accept="image/*" onChange={e => setFormData({...formData, files: Array.from(e.target.files)})} />
              </label>
            </div>
            <div className="mt-6 md:mt-8 flex gap-4 pb-4 md:pb-0">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 font-bold text-gray-400">Hủy</button>
              <button type="submit" disabled={loading} className="flex-[2] py-4 bg-pink-500 text-white rounded-xl md:rounded-2xl font-black shadow-lg">
                {loading ? "ĐANG LƯU..." : "LƯU TỌA ĐỘ"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Places;