import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Gallery({ user }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  
  // State cho Form thêm ảnh mới
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ file: null, caption: '', date: '' });

  const fetchPhotos = async () => {
    try {
const res = await axios.get('https://backend-love.onrender.com/api/photos');      setPhotos(res.data);
    } catch (err) { console.error("Lỗi lấy ảnh:", err); }
  };

  useEffect(() => { fetchPhotos(); }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Không rõ thời gian";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- 1. THÊM ẢNH (CREATE) ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!newPhoto.file) return alert("Vui lòng chọn ảnh!");

    setUploading(true);
    const data = new FormData();
    data.append('image', newPhoto.file);
    data.append('caption', newPhoto.caption || "Khoảnh khắc đáng nhớ");
    if (newPhoto.date) data.append('custom_date', newPhoto.date);

    try {
      await axios.post('http://localhost:5000/api/photos', data);
      setShowUploadForm(false);
      setNewPhoto({ file: null, caption: '', date: '' });
      fetchPhotos();
    } catch (err) {
      alert("Lỗi upload ảnh.");
    } finally {
      setUploading(false);
    }
  };

  // --- 2. XÓA ẢNH (DELETE) ---
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa kỷ niệm này vĩnh viễn không?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/photos/${id}`);
      fetchPhotos();
      if (currentIndex !== null) setCurrentIndex(null);
    } catch (err) { alert("Lỗi khi xóa ảnh."); }
  };

  // --- 3. SỬA CHÚ THÍCH (UPDATE) ---
  const handleEditCaption = async (e, photo) => {
    e.stopPropagation();
    const newCaption = prompt("Sửa lời nhắn cho ảnh này:", photo.caption);
    if (newCaption === null || newCaption === photo.caption) return;
    try {
      await axios.put(`http://localhost:5000/api/photos/${photo.id}`, { caption: newCaption });
      fetchPhotos();
    } catch (err) { alert("Lỗi khi cập nhật."); }
  };

  return (
    <div className="p-4 animate-fadeIn">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-black text-gray-800 mb-2 tracking-tighter">Album Ảnh 📸</h2>
        <p className="text-pink-400 font-medium italic">"Lưu giữ từng giây phút bên nhau"</p>
      </div>

      {/* NÚT THÊM (Chỉ Admin) */}
      {user?.role === 'admin' && (
        <div className="mb-12 flex justify-center">
          <button 
            onClick={() => setShowUploadForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold rounded-[2rem] shadow-lg hover:shadow-pink-200 transition-all hover:-translate-y-1"
          >
            ➕ Thêm khoảnh khắc mới
          </button>
        </div>
      )}

      {/* MODAL FORM THÊM ẢNH */}
      {showUploadForm && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleFormSubmit}
            className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-popIn border-4 border-pink-50"
          >
            <h3 className="text-2xl font-black text-gray-800 mb-6 text-center">Tải lên kỷ niệm ✨</h3>
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2 ml-2">1. Chọn ảnh từ máy</label>
                <input 
                  type="file" accept="image/*"
                  onChange={(e) => setNewPhoto({...newPhoto, file: e.target.files[0]})}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2 ml-2">2. Lời nhắn (Caption)</label>
                <input 
                  type="text" placeholder="Ví dụ: Ngày đầu gặp nhau..."
                  value={newPhoto.caption}
                  onChange={(e) => setNewPhoto({...newPhoto, caption: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2 ml-2">3. Ngày chụp (Nếu muốn lùi ngày)</label>
                <input 
                  type="date" value={newPhoto.date}
                  onChange={(e) => setNewPhoto({...newPhoto, date: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all cursor-pointer"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button type="button" onClick={() => setShowUploadForm(false)} className="flex-1 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-colors">Hủy</button>
              <button type="submit" disabled={uploading} className="flex-1 py-4 bg-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 hover:bg-pink-600 disabled:bg-gray-300 transition-all">
                {uploading ? "Đang gửi..." : "Lưu ngay"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GRID ẢNH */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {photos.map((p, index) => (
          <div 
            key={p.id} 
            onClick={() => setCurrentIndex(index)}
            className="relative group rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border-4 border-white cursor-pointer"
          >
            <img src={p.image_url} alt="" className="w-full h-auto block transform group-hover:scale-105 transition-transform duration-700" />
            
            {/* CÁC NÚT QUẢN LÝ CHO ADMIN TRÊN GRID */}
            {user?.role === 'admin' && (
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={(e) => handleEditCaption(e, p)} className="bg-white/90 p-2 rounded-full text-blue-500 hover:bg-white shadow-md">✏️</button>
                <button onClick={(e) => handleDelete(e, p.id)} className="bg-white/90 p-2 rounded-full text-red-500 hover:bg-white shadow-md">🗑️</button>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
               <p className="text-white text-sm font-bold mb-1 line-clamp-2 italic">"{p.caption}"</p>
               <p className="text-white/60 text-[10px] tracking-widest uppercase">{formatDate(p.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PHÓNG TO */}
      {currentIndex !== null && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={() => setCurrentIndex(null)}>
          <button className="absolute top-8 right-8 text-white/50 hover:text-white text-4xl transition-colors" onClick={() => setCurrentIndex(null)}>&times;</button>
          
          <div className="relative max-w-5xl w-full flex flex-col items-center">
            <img 
              src={photos[currentIndex].image_url} 
              className="max-w-full max-h-[75vh] rounded-3xl shadow-2xl animate-zoomIn object-contain border-4 border-white/10" 
              onClick={(e) => e.stopPropagation()} 
            />
            
            <div className="mt-8 bg-white/10 backdrop-blur-xl px-10 py-5 rounded-[3rem] border border-white/20 text-center animate-slideUp shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
              <p className="text-white text-xl md:text-2xl font-black italic tracking-tight">"{photos[currentIndex].caption}"</p>
              <p className="text-pink-300 text-xs mt-3 font-bold uppercase tracking-[0.2em]">📅 {formatDate(photos[currentIndex].created_at)}</p>
              
              {/* NÚT SỬA TRONG MODAL DÀNH CHO ADMIN */}
              {user?.role === 'admin' && (
                <div className="mt-4 flex justify-center gap-4">
                  <button onClick={(e) => handleEditCaption(e, photos[currentIndex])} className="text-[10px] text-blue-300 hover:text-white underline tracking-widest uppercase">Chỉnh sửa lời nhắn</button>
                  <button onClick={(e) => handleDelete(e, photos[currentIndex].id)} className="text-[10px] text-red-400 hover:text-white underline tracking-widest uppercase">Xóa kỷ niệm</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideUp { 0% { transform: translateY(30px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .animate-popIn { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}

export default Gallery;