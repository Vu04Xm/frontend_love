import React, { useState, useEffect } from 'react';
import api from './api'; // 1. Sử dụng api instance thay vì axios thuần

function Memories({ user }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States cho Modal Album
  const [selectedMem, setSelectedMem] = useState(null);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [isViewing, setIsViewing] = useState(false);

  // States cho Form Thêm/Sửa
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', date: '', files: [] });

  useEffect(() => { fetchMemories(); }, []);

  const fetchMemories = async () => {
    try {
      // 2. Gọi api.get thay cho axios.get(link cứng)
      const res = await api.get('/api/memories');
      setMemories(res.data);
    } catch (err) { 
      console.error("Lỗi lấy danh sách kỷ niệm"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleViewAlbum = async (m) => {
    setSelectedMem(m);
    setIsViewing(true);
    setAlbumPhotos([]);
    try {
      // 3. Sử dụng endpoint động thông qua api instance
      const res = await api.get(`/api/memories/${m.id}/photos`);
      setAlbumPhotos(res.data);
    } catch (err) { 
      console.error("Lỗi lấy album ảnh"); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('event_date', formData.date);
    if (formData.files) {
      Array.from(formData.files).forEach(file => data.append('images', file));
    }

    try {
      if (editingId) {
        // 4. Gọi api.put cho cập nhật
        await api.put(`/api/memories/${editingId}`, data);
        alert("Đã cập nhật kỷ niệm! ✨");
      } else {
        // 5. Gọi api.post cho thêm mới
        await api.post('/api/memories', data);
        alert("Đã thêm kỷ niệm mới! ❤️");
      }
      setEditingId(null);
      setFormData({ title: '', content: '', date: '', files: [] });
      fetchMemories();
    } catch (err) { 
      alert("Lỗi lưu dữ liệu. Vui lòng kiểm tra lại kết nối."); 
    }
  };

  const handleEdit = (e, m) => {
    e.stopPropagation();
    setEditingId(m.id);
    setFormData({ 
      title: m.title, 
      content: m.content, 
      date: m.event_date ? m.event_date.split('T')[0] : '', 
      files: [] 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc muốn xóa kỷ niệm này? 😢")) {
      try {
        // 6. Gọi api.delete
        await api.delete(`/api/memories/${id}`);
        fetchMemories();
      } catch (err) { 
        alert("Lỗi khi xóa!"); 
      }
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/30 py-12 px-4 animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-rose-500 mb-2">Love Journal</h1>
          <p className="text-gray-500 italic">"Lưu giữ những khoảnh khắc tuyệt vời nhất"</p>
        </div>

        {/* FORM ADMIN */}
        {user?.role === 'admin' && (
          <div className="mb-16 bg-white p-8 rounded-[2.5rem] shadow-xl border border-rose-100 animate-popIn">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingId ? "✍️ Chỉnh sửa kỷ niệm" : "📸 Thêm kỷ niệm mới"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Tiêu đề kỷ niệm..." required
                  className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-rose-300 transition-all"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                />
                <input 
                  type="date" required
                  className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-rose-300 transition-all"
                  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                />
                <input 
                  type="file" multiple
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:bg-rose-50 file:text-rose-600 font-semibold cursor-pointer"
                  onChange={e => setFormData({...formData, files: e.target.files})}
                />
              </div>
              <textarea 
                placeholder="Câu chuyện của chúng mình hôm đó..." required
                className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-rose-300 transition-all h-full min-h-[150px]"
                value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
              />
              <div className="md:col-span-2 flex gap-4 mt-2">
                <button type="submit" className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all">
                  {editingId ? "CẬP NHẬT THAY ĐỔI ✨" : "LƯU KỶ NIỆM ❤️"}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => {setEditingId(null); setFormData({title:'', content:'', date:'', files:[]})}}
                    className="px-8 bg-gray-200 text-gray-600 rounded-2xl font-bold"
                  >HỦY</button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* DANH SÁCH CARD */}
        {loading ? (
          <div className="text-center text-rose-300 animate-pulse font-bold">Đang tải những kỷ niệm ngọt ngào...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {memories.map((m) => (
              <div 
                key={m.id} 
                onClick={() => handleViewAlbum(m)}
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer relative border-4 border-white"
              >
                <div className="h-60 overflow-hidden">
                  <img src={m.cover_image || 'https://via.placeholder.com/400x300?text=Love'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                     <span className="text-rose-400 text-xs font-bold uppercase">{new Date(m.event_date).toLocaleDateString('vi-VN')}</span>
                     {user?.role === 'admin' && (
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => handleEdit(e, m)} className="text-teal-500 hover:underline text-sm font-bold">Sửa</button>
                         <button onClick={(e) => handleDelete(e, m.id)} className="text-rose-400 hover:underline text-sm font-bold">Xóa</button>
                       </div>
                     )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mt-2 line-clamp-1">{m.title}</h3>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2 italic">{m.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL XEM ALBUM */}
        {isViewing && selectedMem && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-4 overflow-y-auto animate-fadeIn">
            <button onClick={() => setIsViewing(false)} className="fixed top-8 right-8 text-white text-5xl font-light hover:rotate-90 transition-all z-[110]">✕</button>
            <div className="w-full max-w-5xl mx-auto py-10">
              <div className="text-center mb-12 text-white animate-slideUp">
                <h2 className="text-5xl font-black mb-4 tracking-tighter">{selectedMem.title}</h2>
                <p className="text-rose-200 text-lg italic bg-white/10 inline-block px-6 py-2 rounded-full">"{selectedMem.content}"</p>
              </div>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 px-4">
                {albumPhotos.map((photo) => (
                  <div key={photo.id} className="break-inside-avoid rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10 animate-popIn">
                    <img src={photo.image_url} className="w-full h-auto hover:scale-105 transition-transform duration-500" alt="love" />
                  </div>
                ))}
              </div>
              {albumPhotos.length === 0 && (
                <p className="text-center text-white/50 italic mt-10">Album này hiện chưa có ảnh...</p>
              )}
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-popIn { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default Memories;