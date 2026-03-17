import React, { useState, useEffect } from 'react';
import api from './api';

// Hàm tối ưu ảnh Cloudinary - Bảo bối tiết kiệm băng thông
const optimizeUrl = (url, transform = 'f_auto,q_auto') => {
  if (!url) return 'https://via.placeholder.com/600x400?text=Map+Kỷ+Niệm';
  if (!url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/${transform}/`);
};

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
      // Sắp xếp theo ngày tăng dần để tạo lộ trình thời gian
      const sorted = res.data.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      setPlaces(sorted);
    } catch (err) { 
      console.error("Lỗi lấy địa điểm:", err); 
    }
  };

  useEffect(() => { fetchPlaces(); }, []);

  const openAlbum = async (place) => {
    setSelectedPlace(place);
    setIsViewing(true);
    setAlbumPhotos([]); 
    try {
      const res = await api.get(`/api/places/${place.id}/photos`);
      setAlbumPhotos(res.data);
    } catch (err) { 
      console.error("Lỗi lấy ảnh album:", err); 
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Xóa kỷ niệm này khỏi bản đồ kho báu? 🏴‍☠️")) return;
    try {
      await api.delete(`/api/places/${id}`);
      fetchPlaces();
    } catch (err) { 
      alert("Lỗi khi xóa!"); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.files.length === 0) return alert("Hãy chọn ít nhất 1 tấm ảnh làm mốc nhé!");
    
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
    } catch (err) { 
      alert("Lỗi lưu tọa độ!"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#fffafa] pb-24 md:pb-20 animate-fadeIn">
      {/* HEADER */}
      <div className="py-12 md:py-20 text-center px-4">
        <h2 className="text-4xl md:text-6xl font-black text-pink-500 tracking-tighter mb-4 uppercase">MAP KHO BÁU ❤️</h2>
        <div className="w-24 md:w-32 h-2 bg-pink-100 mx-auto rounded-full mb-6"></div>
        <p className="text-gray-400 font-medium italic mb-8">"Lộ trình hạnh phúc của chúng mình qua từng điểm đến"</p>
        
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowForm(true)} 
            className="px-8 py-4 bg-pink-500 text-white font-black rounded-2xl shadow-xl shadow-pink-100 hover:bg-pink-600 active:scale-95 transition-all text-sm md:text-base"
          >
            ⚓ CẮM MỐC TỌA ĐỘ MỚI
          </button>
        )}
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-10">
        {/* Đường nối Timeline (Dashed Line) */}
        <div className="absolute left-10 md:left-1/2 top-0 bottom-0 w-1 border-l-4 border-dashed border-pink-200 -translate-x-1/2 z-0"></div>

        <div className="space-y-20 md:space-y-40">
          {places.map((p, index) => (
            <div 
              key={p.id} 
              className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-20 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              
              {/* Card Ảnh (Hòn đảo kỷ niệm) */}
              <div 
                onClick={() => openAlbum(p)} 
                className="w-full md:w-1/2 pl-16 md:pl-0 relative group cursor-pointer"
              >
                <div className="p-3 md:p-5 bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border-4 border-white transition-all duration-500 group-hover:rotate-2 group-hover:scale-[1.02] active:scale-95">
                  {/* Thumbnail tối ưu: w_800 */}
                  <img 
                    src={optimizeUrl(p.cover_image, 'w_800,c_fill,g_auto,f_auto,q_auto')} 
                    className="w-full h-56 md:h-80 object-cover rounded-[2rem] md:rounded-[3rem]" 
                    alt={p.title} 
                    loading="lazy"
                  />
                  
                  {user?.role === 'admin' && (
                    <button 
                      onClick={(e) => handleDelete(e, p.id)}
                      className="absolute top-6 right-6 md:top-10 md:right-10 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-red-600 transition-colors z-20"
                    >
                      🗑️
                    </button>
                  )}

                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-pink-500 px-6 py-2 rounded-full shadow-lg border-4 border-white whitespace-nowrap">
                    <span className="text-white font-black text-[10px] md:text-sm uppercase tracking-widest">CHẶNG {index + 1}</span>
                  </div>
                </div>
              </div>

              {/* Marker 📍 */}
              <div className="absolute left-10 md:left-1/2 -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center border-4 border-pink-400 shadow-2xl z-10 shrink-0">
                 <span className="text-2xl md:text-3xl animate-bounce">📍</span>
              </div>

              {/* Thông tin chặng đường */}
              <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                <div className={`inline-block px-4 py-1 rounded-full bg-pink-50 text-pink-500 font-black text-[10px] md:text-xs mb-3 uppercase tracking-[0.2em] shadow-sm`}>
                  {new Date(p.event_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
                <h3 className="text-2xl md:text-4xl font-black text-gray-800 mb-3 md:mb-5 leading-tight uppercase tracking-tighter">{p.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm md:text-xl italic font-medium max-w-md mx-auto md:mx-0">"{p.description}"</p>
                
                <button 
                  onClick={() => openAlbum(p)} 
                  className={`mt-6 text-pink-500 font-black flex items-center gap-3 hover:gap-5 transition-all text-sm md:text-lg uppercase tracking-wider ${index % 2 === 0 ? 'md:flex-row-reverse md:ml-auto' : ''}`}
                >
                  MỞ KHO BÁU 💎 <span>{index % 2 === 0 ? '←' : '→'}</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* MODAL XEM ALBUM ẢNH ĐỊA ĐIỂM */}
      {isViewing && selectedPlace && (
        <div className="fixed inset-0 z-[2000] bg-white md:bg-white/98 backdrop-blur-2xl overflow-y-auto animate-fadeIn flex flex-col">
          <button 
            onClick={() => setIsViewing(false)} 
            className="fixed top-5 right-5 md:top-10 md:right-10 w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center text-3xl font-bold z-[2001] shadow-2xl active:scale-90 transition-all"
          >
            ✕
          </button>
          
          <div className="max-w-6xl mx-auto py-16 md:py-24 px-4 md:px-10">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter uppercase leading-none">{selectedPlace.title}</h2>
              <div className="h-1.5 w-20 bg-pink-400 mx-auto rounded-full mb-6"></div>
              <p className="text-pink-500 font-bold text-base md:text-2xl italic">"{selectedPlace.description}"</p>
            </div>
            
            {/* Masonry Layout cho ảnh trong album địa điểm */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 md:gap-8 space-y-5 md:space-y-8">
              {albumPhotos.length > 0 ? albumPhotos.map((img, idx) => (
                <div key={img.id} className="relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] shadow-xl border-4 border-white animate-popIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <img 
                    src={optimizeUrl(img.image_url, 'w_1000,c_limit,f_auto,q_auto')} 
                    className="w-full h-auto block transform group-hover:scale-105 transition-transform duration-700 cursor-zoom-in" 
                    alt="place-memory" 
                    loading="lazy"
                    onClick={() => window.open(img.image_url, '_blank')}
                  />
                </div>
              )) : (
                <div className="col-span-full text-center py-20">
                    <p className="text-gray-300 text-xl italic animate-pulse">Đang lặn tìm kho báu...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FORM THÊM - Bottom Sheet / Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 animate-fadeIn">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white w-full md:max-w-lg rounded-t-[3rem] md:rounded-[4rem] p-10 md:p-12 shadow-2xl border-t-8 border-pink-400 md:border-8 animate-popIn"
          >
            <h3 className="text-2xl md:text-4xl font-black text-center mb-8 md:mb-10 text-gray-800 uppercase tracking-tighter">CẮM MỐC TỌA ĐỘ ⚓</h3>
            <div className="space-y-4 md:space-y-6">
              <input type="text" placeholder="Tên địa điểm (Ví dụ: Hồ Tây...)" required className="w-full p-5 rounded-2xl bg-pink-50/50 border-2 border-transparent outline-none focus:border-pink-300 text-sm md:text-lg font-bold transition-all" onChange={e => setFormData({...formData, title: e.target.value})} />
              <textarea placeholder="Ghi chú về kỷ niệm tại đây..." className="w-full p-5 rounded-2xl bg-pink-50/50 border-2 border-transparent outline-none focus:border-pink-300 text-sm md:text-lg font-medium transition-all" rows="3" onChange={e => setFormData({...formData, desc: e.target.value})} />
              <input type="date" required className="w-full p-5 rounded-2xl bg-pink-50/50 border-2 border-transparent outline-none focus:border-pink-300 text-sm md:text-lg font-black" onChange={e => setFormData({...formData, date: e.target.value})} />
              <label className="flex flex-col items-center justify-center p-8 md:p-12 bg-pink-50/80 rounded-[2.5rem] border-4 border-dashed border-pink-200 cursor-pointer hover:bg-pink-100 transition-colors group">
                <span className="text-4xl group-hover:scale-125 transition-transform duration-300">📸</span>
                <span className="text-pink-600 font-black mt-3 text-xs md:text-sm uppercase tracking-widest">{formData.files.length > 0 ? `ĐÃ CHỌN ${formData.files.length} ẢNH` : "CHỌN ẢNH KHO BÁU"}</span>
                <input type="file" multiple hidden accept="image/*" onChange={e => setFormData({...formData, files: Array.from(e.target.files)})} />
              </label>
            </div>
            <div className="mt-10 flex gap-4 pb-10 md:pb-0">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-5 font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest text-xs">ĐÓNG</button>
              <button type="submit" disabled={loading} className="flex-[2] py-5 bg-pink-500 text-white rounded-[2rem] font-black shadow-xl shadow-pink-100 active:scale-95 transition-all text-sm md:text-lg uppercase">
                {loading ? "ĐANG LƯU..." : "LƯU TỌA ĐỘ ❤️"}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0.9) translateY(30px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-popIn { animation: popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #fbcfe8; border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default Places;