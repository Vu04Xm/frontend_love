import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:5000/api/memories";

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
      const res = await axios.get(API_URL);
      setMemories(res.data);
    } catch (err) { console.error("Lỗi lấy danh sách"); }
    finally { setLoading(false); }
  };

  const handleViewAlbum = async (m) => {
    setSelectedMem(m);
    setIsViewing(true);
    setAlbumPhotos([]);
    try {
      const res = await axios.get(`${API_URL}/${m.id}/photos`);
      setAlbumPhotos(res.data);
    } catch (err) { console.error("Lỗi lấy album ảnh"); }
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
        await axios.put(`${API_URL}/${editingId}`, data);
        alert("Đã cập nhật kỷ niệm! ✨");
      } else {
        await axios.post(API_URL, data);
        alert("Đã thêm kỷ niệm mới! ❤️");
      }
      setEditingId(null);
      setFormData({ title: '', content: '', date: '', files: [] });
      fetchMemories();
    } catch (err) { alert("Lỗi lưu dữ liệu"); }
  };

  const handleEdit = (e, m) => {
    e.stopPropagation(); // Ngăn mở album khi bấm nút sửa
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
    e.stopPropagation(); // Ngăn mở album khi bấm nút xóa
    if (window.confirm("Bạn có chắc muốn xóa kỷ niệm này? 😢")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchMemories();
      } catch (err) { alert("Lỗi khi xóa!"); }
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-rose-500 mb-2">Love Journal</h1>
          <p className="text-gray-500 italic">"Lưu giữ những khoảnh khắc tuyệt vời nhất"</p>
        </div>

        {/* FORM ADMIN - ĐÃ LẮP LẠI ĐẦY ĐỦ */}
        {user?.role === 'admin' && (
          <div className="mb-16 bg-white p-8 rounded-[2.5rem] shadow-xl border border-rose-100">
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
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:bg-rose-50 file:text-rose-600 font-semibold"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {memories.map((m) => (
            <div 
              key={m.id} 
              onClick={() => handleViewAlbum(m)}
              className="group bg-white rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer relative border-4 border-white"
            >
              <div className="h-60 overflow-hidden">
                <img src={m.cover_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                   <span className="text-rose-400 text-xs font-bold uppercase">{new Date(m.event_date).toLocaleDateString('vi-VN')}</span>
                   {/* Nút Sửa/Xóa nhỏ gọn trên Card */}
                   {user?.role === 'admin' && (
                     <div className="flex gap-2">
                       <button onClick={(e) => handleEdit(e, m)} className="text-teal-500 hover:text-teal-700 p-1">Sửa</button>
                       <button onClick={(e) => handleDelete(e, m.id)} className="text-rose-400 hover:text-rose-600 p-1">Xóa</button>
                     </div>
                   )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mt-2 line-clamp-1">{m.title}</h3>
                <p className="text-gray-400 text-sm mt-2 line-clamp-2 italic">{m.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- MODAL XEM ALBUM (Giữ nguyên phần lộng lẫy) --- */}
        {isViewing && selectedMem && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-5xl my-auto py-10">
              <button onClick={() => setIsViewing(false)} className="fixed top-8 right-8 text-white text-5xl font-light hover:rotate-90 transition-all">✕</button>
              <div className="text-center mb-12 text-white">
                <h2 className="text-5xl font-black mb-4">{selectedMem.title}</h2>
                <p className="text-rose-200 text-lg italic">"{selectedMem.content}"</p>
              </div>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 px-4">
                {albumPhotos.map((photo) => (
                  <div key={photo.id} className="break-inside-avoid rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10">
                    <img src={photo.photo_url} className="w-full h-auto hover:scale-110 transition-transform duration-500" alt="love" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Memories;