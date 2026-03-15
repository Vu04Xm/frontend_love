import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
      const res = await axios.get('http://localhost:5000/api/places');
      // Sắp xếp theo thời gian tăng dần cho đúng lộ trình map
      const sorted = res.data.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      setPlaces(sorted);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPlaces(); }, []);

  const openAlbum = async (place) => {
    setSelectedPlace(place);
    setIsViewing(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/places/${place.id}/photos`);
      setAlbumPhotos(res.data);
    } catch (err) { console.error(err); }
  };

  // Hàm xóa kỷ niệm
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Ngăn sự kiện click mở album
    if (!window.confirm("Hai bạn có chắc chắn muốn xóa kỷ niệm này không? Kho báu sẽ biến mất mãi mãi đó! 🏴‍☠️")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/places/${id}`);
      alert("Đã xóa chặng đường này!");
      fetchPlaces();
    } catch (err) {
      alert("Lỗi khi xóa!");
    }
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
      await axios.post('http://localhost:5000/api/places', data);
      setShowForm(false);
      setFormData({ title: '', desc: '', date: '', files: [] });
      fetchPlaces();
    } catch (err) { alert("Lỗi lưu!"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fffafa] pb-20">
      <div className="py-16 text-center">
        <h2 className="text-5xl font-black text-pink-500 tracking-tighter mb-4 animate-pulse">MAP KHO BÁU ❤️</h2>
        <div className="w-24 h-1.5 bg-pink-200 mx-auto rounded-full"></div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowForm(true)} className="mt-8 px-8 py-3 bg-pink-500 text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all">
            + Cắm mốc mới ⚓
          </button>
        )}
      </div>

      <div className="relative max-w-5xl mx-auto px-6">
        {/* Đường nối */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 border-l-4 border-dashed border-pink-200 -translate-x-1/2 z-0 hidden md:block"></div>

        <div className="space-y-32">
          {places.map((p, index) => (
            <div key={p.id} className={`flex flex-col md:flex-row items-center gap-10 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              
              {/* Card Ảnh - Hòn đảo */}
              <div onClick={() => openAlbum(p)} className="w-full md:w-1/2 relative group cursor-pointer">
                <div className="p-4 bg-white rounded-[2.5rem] shadow-2xl border-4 border-white transition-all group-hover:-rotate-2">
                  <img src={p.cover_image} className="w-full h-72 object-cover rounded-[2rem]" alt="" />
                  
                  {/* Nút Admin - Xóa */}
                  {user?.role === 'admin' && (
                    <button 
                      onClick={(e) => handleDelete(e, p.id)}
                      className="absolute top-8 right-8 w-10 h-10 bg-red-500/80 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                      title="Xóa mốc này"
                    >
                      🗑️
                    </button>
                  )}

                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-lg border-2 border-pink-100">
                    <span className="text-pink-500 font-black text-sm">Chặng {index + 1}</span>
                  </div>
                </div>
              </div>

              {/* Marker 📍 */}
              <div className="hidden md:flex w-14 h-14 bg-white rounded-full items-center justify-center border-4 border-pink-400 shadow-xl z-10 shrink-0">
                 <span className="text-2xl animate-bounce">📍</span>
              </div>

              {/* Thông tin */}
              <div className="w-full md:w-1/2 text-center md:text-left">
                <p className="text-pink-400 font-bold mb-2 uppercase tracking-widest italic">
                  {new Date(p.event_date).toLocaleDateString('vi-VN')}
                </p>
                <h3 className="text-3xl font-black text-gray-800 mb-4">{p.title}</h3>
                <p className="text-gray-500 leading-relaxed text-lg">"{p.description}"</p>
                <button onClick={() => openAlbum(p)} className="mt-6 text-pink-500 font-black flex items-center gap-2 hover:gap-4 transition-all mx-auto md:mx-0">
                  XEM KHO BÁU 💎 <span>→</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* MODAL XEM ẢNH - TONE HỒNG TRẮNG */}
      {isViewing && selectedPlace && (
        <div className="fixed inset-0 z-[2000] bg-white/95 backdrop-blur-lg overflow-y-auto animate-fadeIn">
          <button onClick={() => setIsViewing(false)} className="fixed top-8 right-8 text-pink-500 text-4xl font-bold z-[2001]">✕</button>
          <div className="max-w-6xl mx-auto py-20 px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-gray-800 mb-4 tracking-tighter">{selectedPlace.title}</h2>
              <p className="text-pink-400 font-bold text-lg italic">"{selectedPlace.description}"</p>
            </div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {albumPhotos.map((img) => (
                <img key={img.id} src={img.image_url} className="w-full rounded-[2rem] border-4 border-white shadow-xl hover:scale-[1.02] transition-transform" alt="memory" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FORM THÊM - ADMIN */}
      {showForm && (
        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl border-8 border-pink-50">
            <h3 className="text-3xl font-black text-center mb-8 text-gray-800">CẮM MỐC TỌA ĐỘ ⚓</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Địa điểm..." required className="w-full p-4 rounded-2xl bg-pink-50/50 border-2 border-pink-100 outline-none focus:border-pink-400" onChange={e => setFormData({...formData, title: e.target.value})} />
              <textarea placeholder="Ghi chú..." className="w-full p-4 rounded-2xl bg-pink-50/50 border-2 border-pink-100 outline-none" rows="3" onChange={e => setFormData({...formData, desc: e.target.value})} />
              <input type="date" required className="w-full p-4 rounded-2xl bg-pink-50/50 border-2 border-pink-100 outline-none" onChange={e => setFormData({...formData, date: e.target.value})} />
              <label className="flex flex-col items-center justify-center p-8 bg-pink-50 rounded-3xl border-2 border-dashed border-pink-200 cursor-pointer">
                <span className="text-3xl">📸</span>
                <span className="text-pink-600 font-bold mt-2">{formData.files.length > 0 ? `Đã chọn ${formData.files.length} ảnh` : "Chọn ảnh kỷ niệm"}</span>
                <input type="file" multiple hidden accept="image/*" onChange={e => setFormData({...formData, files: Array.from(e.target.files)})} />
              </label>
            </div>
            <div className="mt-8 flex gap-4">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 font-bold text-gray-400">Hủy</button>
              <button type="submit" disabled={loading} className="flex-1 py-4 bg-pink-500 text-white rounded-2xl font-bold shadow-lg">LƯU TỌA ĐỘ</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Places;