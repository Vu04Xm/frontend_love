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

  // [FETCH] Lấy danh sách kỷ niệm
  const fetchMemories = async () => {
    try {
      const res = await api.get('/api/memories');
      setMemories(res.data);
    } catch (err) { 
      console.error("Lỗi lấy danh sách:", err);
      const msg = err.response?.data?.error || "Không thể kết nối đến máy chủ Render.";
      alert(`⚠️ Lỗi tải dữ liệu: ${msg}`);
    } finally { 
      setLoading(false); 
    }
  };

  // [VIEW] Xem album ảnh chi tiết
  const handleViewAlbum = async (m) => {
    setSelectedMem(m);
    setIsViewing(true);
    setAlbumPhotos([]); // Reset ảnh cũ tránh hiện nhầm ảnh kỷ niệm trước
    try {
      const res = await api.get(`/api/memories/${m.id}/photos`);
      setAlbumPhotos(res.data);
    } catch (err) { 
      console.error("Lỗi lấy album ảnh:", err);
      alert("Không thể tải album ảnh của kỷ niệm này.");
    }
  };

  // [SUBMIT] Thêm hoặc Cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return alert("Vui lòng điền đủ Tiêu đề và Ngày!");

    setIsSubmitting(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('event_date', formData.date); // Khớp tên field với Backend
    
    if (formData.files && formData.files.length > 0) {
      Array.from(formData.files).forEach(file => {
        data.append('images', file); // 'images' phải khớp với upload.array('images') ở backend
      });
    }

    try {
      if (editingId) {
        await api.put(`/api/memories/${editingId}`, data);
        alert("✨ Tuyệt vời! Kỷ niệm đã được cập nhật.");
      } else {
        await api.post('/api/memories', data);
        alert("❤️ Một khoảnh khắc nữa đã được lưu giữ!");
      }
      
      // Thành công thì Reset
      setEditingId(null);
      setFormData({ title: '', content: '', date: '', files: [] });
      fetchMemories();
    } catch (err) { 
      console.error("Lỗi CRUD:", err);
      // Bẫy lỗi 500/Undefined chuyên nghiệp
      const serverMsg = err.response?.data?.error || "Server đang bận hoặc bị sập.";
      const detailMsg = err.response?.data?.details || "Kiểm tra dung lượng ảnh hoặc kết nối DB.";
      alert(`❌ LỖI LƯU DỮ LIỆU:\n- Lỗi: ${serverMsg}\n- Chi tiết: ${detailMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // [EDIT] Đưa dữ liệu lên Form
  const handleEdit = (e, m) => {
    e.stopPropagation(); // Ngăn mở Modal khi nhấn nút Sửa
    setEditingId(m.id);
    
    // Format ngày từ SQL (2026-03-15T...) sang (2026-03-15) cho input date
    const dateOnly = m.event_date ? new Date(m.event_date).toISOString().split('T')[0] : '';
    
    setFormData({ 
      title: m.title, 
      content: m.content, 
      date: dateOnly, 
      files: [] 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // [DELETE] Xóa kỷ niệm
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("🗑️ Bạn có chắc muốn xóa vĩnh viễn không?")) {
      try {
        await api.delete(`/api/memories/${id}`);
        alert("Đã xóa xong!");
        fetchMemories();
      } catch (err) { 
        alert(`❌ Lỗi xóa: ${err.response?.data?.error || "Không thể thực hiện"}`); 
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

        {/* FORM CHO ADMIN */}
        {user?.role === 'admin' && (
          <div className="mb-16 bg-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-rose-50 animate-popIn">
            <h2 className="text-2xl font-black mb-6 text-gray-800">
              {editingId ? "✍️ CẬP NHẬT KỶ NIỆM" : "📸 KỶ NIỆM MỚI"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Tiêu đề..." required
                  className="w-full p-4 rounded-2xl bg-rose-50/30 border-2 border-transparent focus:border-rose-200 outline-none transition-all font-bold"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                />
                <input 
                  type="date" required
                  className="w-full p-4 rounded-2xl bg-rose-50/30 border-2 border-transparent focus:border-rose-200 outline-none transition-all font-bold"
                  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                />
                <input 
                  type="file" multiple accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-rose-500 file:text-white cursor-pointer"
                  onChange={e => setFormData({...formData, files: e.target.files})}
                />
              </div>
              <textarea 
                placeholder="Nội dung..." required
                className="w-full p-4 rounded-2xl bg-rose-50/30 border-2 border-transparent focus:border-rose-200 outline-none transition-all h-full min-h-[150px]"
                value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
              />
              <div className="md:col-span-2 flex gap-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95">
                  {isSubmitting ? "ĐANG XỬ LÝ..." : (editingId ? "CẬP NHẬT ✨" : "LƯU KỶ NIỆM ❤️")}
                </button>
                {editingId && (
                  <button type="button" onClick={() => {setEditingId(null); setFormData({title:'', content:'', date:'', files:[]})}} className="px-8 bg-gray-100 text-gray-500 rounded-2xl font-bold">HỦY</button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* DANH SÁCH KỶ NIỆM */}
        {loading ? (
          <div className="text-center py-20 text-rose-400 font-bold">Đang mở cuốn nhật ký...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {memories.map((m) => (
              <div key={m.id} onClick={() => handleViewAlbum(m)} className="group bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-white">
                <div className="h-60 overflow-hidden">
                  <img src={m.cover_image || 'https://via.placeholder.com/400x300?text=Love'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                       {new Date(m.event_date).toLocaleDateString('vi-VN')}
                    </span>
                    {user?.role === 'admin' && (
                      <div className="flex gap-2">
                        <button onClick={(e) => handleEdit(e, m)} className="p-1.5 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-500 hover:text-white">✏️</button>
                        <button onClick={(e) => handleDelete(e, m.id)} className="p-1.5 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-500 hover:text-white">🗑️</button>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-gray-800 mb-2 line-clamp-1">{m.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 italic">"{m.content}"</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL ALBUM */}
        {isViewing && selectedMem && (
          <div className="fixed inset-0 z-[100] bg-white/98 backdrop-blur-xl flex flex-col p-6 overflow-y-auto animate-fadeIn">
            <button onClick={() => setIsViewing(false)} className="fixed top-6 right-6 text-rose-500 text-4xl font-light hover:rotate-90 transition-all z-[110]">✕</button>
            <div className="w-full max-w-5xl mx-auto py-10">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-gray-800 mb-4 uppercase">{selectedMem.title}</h2>
                <p className="text-rose-400 italic">"{selectedMem.content}"</p>
              </div>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {albumPhotos.map((photo) => (
                  <div key={photo.id} className="break-inside-avoid rounded-3xl overflow-hidden shadow-xl border-4 border-white animate-popIn">
                    {/* KHỚP PHOTO_URL TỪ SQL DUMP */}
                    <img src={photo.photo_url} className="w-full h-auto" alt="love" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-popIn { animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}

export default Memories;