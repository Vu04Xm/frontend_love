import React, { useState, useEffect } from 'react';
import api from './api'; 

function Memories({ user }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMem, setSelectedMem] = useState(null);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [isViewing, setIsViewing] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', date: '', files: [] });

  useEffect(() => { fetchMemories(); }, []);

  const fetchMemories = async () => {
    try {
      const res = await api.get('/api/memories');
      setMemories(res.data);
    } catch (err) { 
      console.error("Lỗi lấy danh sách:", err);
      alert(`⚠️ Lỗi tải dữ liệu: ${err.response?.data?.error || "Không thể kết nối máy chủ."}`);
    } finally { 
      setLoading(false); 
    }
  };

  const handleViewAlbum = async (m) => {
    setSelectedMem(m);
    setIsViewing(true);
    setAlbumPhotos([]); 
    try {
      const res = await api.get(`/api/memories/${m.id}/photos`);
      setAlbumPhotos(res.data);
    } catch (err) { 
      alert("Không thể tải album ảnh.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return alert("Điền đủ Tiêu đề và Ngày nhé!");

    setIsSubmitting(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('event_date', formData.date);
    
    if (formData.files && formData.files.length > 0) {
      Array.from(formData.files).forEach(file => {
        data.append('images', file);
      });
    }

    try {
      if (editingId) {
        await api.put(`/api/memories/${editingId}`, data);
      } else {
        await api.post('/api/memories', data);
      }
      setEditingId(null);
      setFormData({ title: '', content: '', date: '', files: [] });
      fetchMemories();
    } catch (err) { 
      alert(`❌ LỖI: ${err.response?.data?.error || "Server bận"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (e, m) => {
    e.stopPropagation();
    setEditingId(m.id);
    const dateOnly = m.event_date ? new Date(m.event_date).toISOString().split('T')[0] : '';
    setFormData({ title: m.title, content: m.content, date: dateOnly, files: [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("🗑️ Xóa vĩnh viễn kỷ niệm này?")) {
      try {
        await api.delete(`/api/memories/${id}`);
        fetchMemories();
      } catch (err) { alert("Lỗi xóa"); }
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcfc] py-6 md:py-12 px-3 md:px-4 animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-rose-500 mb-2 tracking-tighter uppercase">Love Journal</h1>
          <div className="w-16 md:w-20 h-1.5 bg-rose-200 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-500 italic text-sm md:text-base px-4">"Nơi cất giữ những mảnh ghép hạnh phúc của chúng mình"</p>
        </div>

        {/* FORM CHO ADMIN (Responsive) */}
        {user?.role === 'admin' && (
          <div className="mb-10 md:mb-16 bg-white p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl border-2 md:border-4 border-rose-50 animate-popIn">
            <h2 className="text-lg md:text-2xl font-black mb-6 text-gray-800 flex items-center gap-2">
               {editingId ? "✍️ CẬP NHẬT" : "📸 KỶ NIỆM MỚI"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Tiêu đề..." required
                  className="w-full p-4 rounded-xl md:rounded-2xl bg-rose-50/30 border-2 border-transparent focus:border-rose-200 outline-none transition-all font-bold text-sm md:text-base"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                />
                <input 
                  type="date" required
                  className="w-full p-4 rounded-xl md:rounded-2xl bg-rose-50/30 border-2 border-transparent focus:border-rose-200 outline-none transition-all font-bold text-sm md:text-base"
                  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                />
                <div className="relative">
                  <label className="block text-[10px] text-rose-400 font-bold mb-1 ml-2 uppercase">Thêm ảnh vào album</label>
                  <input 
                    type="file" multiple accept="image/*"
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-rose-500 file:text-white"
                    onChange={e => setFormData({...formData, files: e.target.files})}
                  />
                </div>
              </div>
              <textarea 
                placeholder="Lời nhắn nhủ..." required
                className="w-full p-4 rounded-xl md:rounded-2xl bg-rose-50/30 border-2 border-transparent focus:border-rose-200 outline-none transition-all min-h-[120px] md:h-full text-sm md:text-base"
                value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
              />
              <div className="md:col-span-2 flex flex-col md:flex-row gap-3">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-xl md:rounded-2xl font-black shadow-lg active:scale-95 transition-all text-sm md:text-base">
                  {isSubmitting ? "ĐANG LƯU..." : (editingId ? "CẬP NHẬT NGAY ✨" : "LƯU VÀO NHẬT KÝ ❤️")}
                </button>
                {editingId && (
                  <button type="button" onClick={() => {setEditingId(null); setFormData({title:'', content:'', date:'', files:[]})}} className="py-4 px-8 bg-gray-100 text-gray-500 rounded-xl md:rounded-2xl font-bold text-sm">HỦY</button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* DANH SÁCH KỶ NIỆM (Responsive Grid) */}
        {loading ? (
          <div className="text-center py-20 text-rose-400 font-bold animate-pulse text-sm">Đang lật mở trang nhật ký...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {memories.map((m) => (
              <div key={m.id} onClick={() => handleViewAlbum(m)} className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all cursor-pointer border-2 border-white">
                <div className="h-48 md:h-60 overflow-hidden relative">
                  <img src={m.cover_image || 'https://via.placeholder.com/400x300?text=Love'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                     <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">
                        {new Date(m.event_date).toLocaleDateString('vi-VN')}
                     </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg md:text-xl font-black text-gray-800 line-clamp-1 flex-1">{m.title}</h3>
                    {user?.role === 'admin' && (
                      <div className="flex gap-1 ml-2">
                        <button onClick={(e) => handleEdit(e, m)} className="p-2 bg-teal-50 text-teal-600 rounded-full text-xs">✏️</button>
                        <button onClick={(e) => handleDelete(e, m.id)} className="p-2 bg-rose-50 text-rose-600 rounded-full text-xs">🗑️</button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm line-clamp-2 italic font-medium leading-relaxed">"{m.content}"</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL ALBUM (Tối ưu Fullscreen Mobile) */}
        {isViewing && selectedMem && (
          <div className="fixed inset-0 z-[100] bg-white md:bg-white/98 backdrop-blur-xl flex flex-col p-4 md:p-6 overflow-y-auto animate-fadeIn">
            {/* Nút đóng nổi bật trên mobile */}
            <button onClick={() => setIsViewing(false)} className="fixed top-4 right-4 bg-rose-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all z-[110] active:scale-90 md:bg-transparent md:text-rose-500 md:text-4xl md:shadow-none">✕</button>
            
            <div className="w-full max-w-5xl mx-auto py-8 md:py-10">
              <div className="text-center mb-8 md:mb-12 px-4">
                <h2 className="text-2xl md:text-4xl font-black text-gray-800 mb-3 uppercase tracking-tighter leading-tight">{selectedMem.title}</h2>
                <p className="text-rose-400 italic text-sm md:text-lg">"{selectedMem.content}"</p>
                <div className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                   📅 {new Date(selectedMem.event_date).toLocaleDateString('vi-VN')}
                </div>
              </div>

              {/* Grid ảnh Album Masonry */}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 px-2">
                {albumPhotos.length > 0 ? albumPhotos.map((photo) => (
                  <div key={photo.id} className="break-inside-avoid rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border-2 md:border-4 border-white animate-popIn">
                    <img src={photo.photo_url} className="w-full h-auto block" alt="love" loading="lazy" />
                  </div>
                )) : (
                   <div className="col-span-full text-center py-10 text-gray-300 italic">Album hiện chưa có ảnh...</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-popIn { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .break-inside-avoid { break-inside: avoid; }
      `}</style>
    </div>
  );
}

export default Memories;