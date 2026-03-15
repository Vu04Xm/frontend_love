import React, { useState, useEffect } from 'react';
import api from './api'; 

function Memories({ user }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States cho Modal Album
  const [selectedMem, setSelectedMem] = useState(null);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [isViewing, setIsViewing] = useState(false);

  // States cho Form Thêm/Sửa
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
      // Bẫy lỗi khi không tải được danh sách
      const msg = err.response?.data?.error || "Không thể kết nối đến máy chủ.";
      alert(`⚠️ Lỗi tải dữ liệu: ${msg}`);
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
      console.error("Lỗi lấy album ảnh:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('event_date', formData.date);
    
    if (formData.files && formData.files.length > 0) {
      Array.from(formData.files).forEach(file => {
        data.append('images', file); // Chú ý: 'images' phải khớp với upload.array('images') ở backend
      });
    }

    try {
      if (editingId) {
        await api.put(`/api/memories/${editingId}`, data);
        alert("✨ Tuyệt vời! Kỷ niệm đã được cập nhật thành công.");
      } else {
        await api.post('/api/memories', data);
        alert("❤️ Một khoảnh khắc nữa đã được lưu giữ!");
      }
      
      // Reset Form sau khi thành công
      setEditingId(null);
      setFormData({ title: '', content: '', date: '', files: [] });
      fetchMemories();
    } catch (err) { 
      // BẪY LỖI CHI TIẾT TẠI ĐÂY
      console.error("Lỗi CRUD:", err);
      const serverError = err.response?.data?.error || "Lỗi không xác định";
      const detailError = err.response?.data?.details || "";
      
      alert(`❌ Lỗi lưu dữ liệu:\n- Lý do: ${serverError}\n${detailError ? `- Chi tiết: ${detailError}` : ""}\n\nMẹo: Kiểm tra Tab Network (F12) để xem chi tiết hơn.`);
    } finally {
      setIsSubmitting(false);
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
    if (window.confirm("🗑️ Bạn có chắc muốn xóa vĩnh viễn kỷ niệm này không? Hành động này không thể hoàn tác!")) {
      try {
        await api.delete(`/api/memories/${id}`);
        alert("Đã xóa xong!");
        fetchMemories();
      } catch (err) { 
        const msg = err.response?.data?.error || "Không thể xóa.";
        alert(`❌ Lỗi xóa: ${msg}`); 
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcfc] py-12 px-4 animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-rose-500 mb-2 tracking-tighter">Love Journal</h1>
          <div className="w-20 h-1.5 bg-rose-200 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-500 italic font-medium">"Nơi cất giữ những mảnh ghép hạnh phúc của chúng mình"</p>
        </div>

        {/* FORM ADMIN */}
        {user?.role === 'admin' && (
          <div className="mb-16 bg-white p-10 rounded-[3rem] shadow-2xl shadow-rose-100/50 border-4 border-rose-50 animate-popIn">
            <h2 className="text-2xl font-black mb-8 text-gray-800 flex items-center gap-3">
              {editingId ? "✍️ CẬP NHẬT KỶ NIỆM" : "📸 CẮM MỐC KỶ NIỆM MỚI"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-400 mb-2 ml-2">CHỦ ĐỀ</label>
                  <input 
                    type="text" placeholder="Hôm đó mình đi đâu, làm gì..." required
                    className="w-full p-5 rounded-3xl bg-rose-50/30 border-2 border-transparent focus:border-rose-200 focus:bg-white outline-none transition-all text-gray-700 font-bold"
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-bold text-gray-400 mb-2 ml-2">NGÀY THÁNG</label>
                  <input 
                    type="date" required
                    className="w-full p-5 rounded-3xl bg-rose-50/30 border-2 border-transparent focus:border-rose-200 focus:bg-white outline-none transition-all text-gray-700 font-bold"
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-bold text-gray-400 mb-2 ml-2">HÌNH ẢNH (Tối đa 15 ảnh)</label>
                  <div className="relative">
                    <input 
                      type="file" multiple accept="image/*"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-4 file:px-8 file:rounded-full file:border-0 file:bg-rose-500 file:text-white file:font-black hover:file:bg-rose-600 file:transition-all cursor-pointer"
                      onChange={e => setFormData({...formData, files: e.target.files})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-bold text-gray-400 mb-2 ml-2">NỘI DUNG</label>
                <textarea 
                  placeholder="Viết lại vài dòng cảm xúc ngọt ngào nhé..." required
                  className="w-full p-6 rounded-[2rem] bg-rose-50/30 border-2 border-transparent focus:border-rose-200 focus:bg-white outline-none transition-all h-full min-h-[200px] text-gray-700 leading-relaxed"
                  value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 flex gap-4 mt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`flex-1 ${isSubmitting ? 'bg-gray-400' : 'bg-rose-500 hover:bg-rose-600'} text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-rose-200 transition-all active:scale-95`}
                >
                  {isSubmitting ? "ĐANG LƯU KHO BÁU..." : (editingId ? "CẬP NHẬT THAY ĐỔI ✨" : "NIÊM PHONG KỶ NIỆM ❤️")}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => {setEditingId(null); setFormData({title:'', content:'', date:'', files:[]})}}
                    className="px-10 bg-gray-100 text-gray-500 rounded-3xl font-bold hover:bg-gray-200 transition-all"
                  >HỦY</button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* DANH SÁCH CARD */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
             <p className="text-rose-400 font-black animate-pulse">Đang mở cuốn nhật ký tình yêu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {memories.map((m) => (
              <div 
                key={m.id} 
                onClick={() => handleViewAlbum(m)}
                className="group bg-white rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer relative border-4 border-white hover:-translate-y-2"
              >
                <div className="h-72 overflow-hidden relative">
                  <img src={m.cover_image || 'https://via.placeholder.com/400x300?text=Love'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                      <span className="text-white font-black">XEM CHI TIẾT 💎</span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-3">
                     <span className="bg-rose-50 text-rose-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                        {new Date(m.event_date).toLocaleDateString('vi-VN')}
                     </span>
                     {user?.role === 'admin' && (
                       <div className="flex gap-3">
                         <button onClick={(e) => handleEdit(e, m)} className="p-2 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-500 hover:text-white transition-all">
                            <span className="text-xs">✏️</span>
                         </button>
                         <button onClick={(e) => handleDelete(e, m.id)} className="p-2 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-500 hover:text-white transition-all">
                            <span className="text-xs">🗑️</span>
                         </button>
                       </div>
                     )}
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-3 group-hover:text-rose-500 transition-colors line-clamp-1">{m.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed italic">"{m.content}"</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL XEM ALBUM (Giữ nguyên phần UI đẹp của bạn) */}
        {isViewing && selectedMem && (
          <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-2xl flex flex-col p-4 overflow-y-auto animate-fadeIn">
            <button onClick={() => setIsViewing(false)} className="fixed top-8 right-8 text-rose-500 text-5xl font-light hover:rotate-90 transition-all z-[110]">✕</button>
            <div className="w-full max-w-6xl mx-auto py-16">
              <div className="text-center mb-16 animate-slideUp">
                <h2 className="text-6xl font-black text-gray-800 mb-6 tracking-tighter uppercase">{selectedMem.title}</h2>
                <p className="text-rose-400 text-xl italic font-medium bg-rose-50 inline-block px-10 py-3 rounded-full border-2 border-rose-100 shadow-sm">"{selectedMem.content}"</p>
              </div>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 px-4">
                {albumPhotos.map((photo) => (
                  <div key={photo.id} className="break-inside-avoid rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white animate-popIn">
                    <img src={photo.image_url} className="w-full h-auto hover:scale-105 transition-transform duration-700" alt="love" />
                  </div>
                ))}
              </div>
              {albumPhotos.length === 0 && (
                <div className="text-center py-20 bg-rose-50/50 rounded-[3rem] border-4 border-dashed border-rose-100">
                    <p className="text-rose-300 font-bold italic text-xl">Album này đang chờ những bức ảnh đầu tiên...</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideUp { 0% { transform: translateY(30px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-popIn { animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slideUp { animation: slideUp 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default Memories;