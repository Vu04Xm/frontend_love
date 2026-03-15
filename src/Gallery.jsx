import React, { useState, useEffect } from 'react';
import api from './api';

function Gallery({ user }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ file: null, caption: '', date: '' });

  const fetchPhotos = async () => {
    try {
      const res = await api.get('/api/photos');
      setPhotos(res.data);
    } catch (err) { console.error("Lỗi lấy ảnh:", err); }
  };

  useEffect(() => { fetchPhotos(); }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Không rõ thời gian";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!newPhoto.file) return alert("Vui lòng chọn ảnh!");
    setUploading(true);
    const data = new FormData();
    data.append('image', newPhoto.file);
    data.append('caption', newPhoto.caption || "Khoảnh khắc đáng nhớ");
    if (newPhoto.date) data.append('custom_date', newPhoto.date);

    try {
      await api.post('/api/photos', data);
      setShowUploadForm(false);
      setNewPhoto({ file: null, caption: '', date: '' });
      fetchPhotos();
    } catch (err) { alert("Lỗi upload ảnh."); } 
    finally { setUploading(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Xóa vĩnh viễn ảnh này?")) return;
    try {
      await api.delete(`/api/photos/${id}`);
      fetchPhotos();
      if (currentIndex !== null) setCurrentIndex(null);
    } catch (err) { alert("Lỗi khi xóa ảnh."); }
  };

  const handleEditCaption = async (e, photo) => {
    e.stopPropagation();
    const newCaption = prompt("Sửa lời nhắn:", photo.caption);
    if (newCaption === null || newCaption === photo.caption) return;
    try {
      await api.put(`/api/photos/${photo.id}`, { caption: newCaption });
      fetchPhotos();
    } catch (err) { alert("Lỗi khi cập nhật."); }
  };

  return (
    <div className="p-2 md:p-4 animate-fadeIn">
      <div className="mb-6 md:mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-2 tracking-tighter">Album Ảnh 📸</h2>
        <p className="text-pink-400 font-medium italic text-sm md:text-base">"Lưu giữ từng giây phút bên nhau"</p>
      </div>

      {/* NÚT THÊM (Responsive button) */}
      {user?.role === 'admin' && (
        <div className="mb-8 flex justify-center">
          <button 
            onClick={() => setShowUploadForm(true)}
            className="w-full max-w-xs md:max-w-none md:w-auto px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold rounded-2xl md:rounded-[2rem] shadow-lg hover:shadow-pink-200 transition-all active:scale-95"
          >
            ➕ Thêm khoảnh khắc
          </button>
        </div>
      )}

      {/* MODAL FORM THÊM ẢNH (Tối ưu Mobile) */}
      {showUploadForm && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <form 
            onSubmit={handleFormSubmit}
            className="bg-white w-full md:max-w-md rounded-t-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl animate-popIn border-t-4 md:border-4 border-pink-50"
          >
            <h3 className="text-xl md:text-2xl font-black text-gray-800 mb-6 text-center">Tải lên kỷ niệm ✨</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Chọn ảnh</label>
                <input 
                  type="file" accept="image/*"
                  onChange={(e) => setNewPhoto({...newPhoto, file: e.target.files[0]})}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-50 file:text-pink-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Lời nhắn</label>
                <input 
                  type="text" placeholder="Ví dụ: Ngày đầu gặp nhau..."
                  value={newPhoto.caption}
                  onChange={(e) => setNewPhoto({...newPhoto, caption: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:ring-2 focus:ring-pink-300 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Ngày chụp</label>
                <input 
                  type="date" value={newPhoto.date}
                  onChange={(e) => setNewPhoto({...newPhoto, date: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:ring-2 focus:ring-pink-300 outline-none text-sm"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3 pb-4 md:pb-0">
              <button type="button" onClick={() => setShowUploadForm(false)} className="flex-1 py-3 font-bold text-gray-400">Hủy</button>
              <button type="submit" disabled={uploading} className="flex-[2] py-3 bg-pink-500 text-white rounded-xl font-bold shadow-lg">
                {uploading ? "Đang gửi..." : "Lưu ngay"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GRID ẢNH (Masonry Responsive) */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 md:gap-4 space-y-2 md:space-y-4">
        {photos.map((p, index) => (
          <div 
            key={p.id} 
            onClick={() => setCurrentIndex(index)}
            className="relative group rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border-2 md:border-4 border-white cursor-pointer break-inside-avoid"
          >
            <img src={p.image_url} alt="" className="w-full h-auto block transform group-hover:scale-105 transition-transform duration-700" loading="lazy" />
            
            {/* Control buttons (Mobile: Luôn hiện nhẹ, Desktop: Hover hiện) */}
            {user?.role === 'admin' && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={(e) => handleEditCaption(e, p)} className="bg-white/90 p-1.5 md:p-2 rounded-full text-blue-500 shadow-md text-xs md:text-base">✏️</button>
                <button onClick={(e) => handleDelete(e, p.id)} className="bg-white/90 p-1.5 md:p-2 rounded-full text-red-500 shadow-md text-xs md:text-base">🗑️</button>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 md:p-6">
               <p className="text-white text-[10px] md:text-sm font-bold mb-1 line-clamp-2 italic">"{p.caption}"</p>
               <p className="text-white/60 text-[8px] md:text-[10px] tracking-widest uppercase">{formatDate(p.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PHÓNG TO (Responsive) */}
      {currentIndex !== null && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 md:p-4 animate-fadeIn" onClick={() => setCurrentIndex(null)}>
          <button className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 text-3xl" onClick={() => setCurrentIndex(null)}>&times;</button>
          
          <div className="relative max-w-5xl w-full flex flex-col items-center">
            <img 
              src={photos[currentIndex].image_url} 
              className="max-w-full max-h-[65vh] md:max-h-[75vh] rounded-2xl md:rounded-3xl shadow-2xl animate-zoomIn object-contain" 
              onClick={(e) => e.stopPropagation()} 
            />
            
            <div className="mt-4 md:mt-8 bg-white/10 backdrop-blur-md px-6 py-4 md:px-10 md:py-5 rounded-2xl md:rounded-[3rem] border border-white/20 text-center w-[90%] md:w-auto" onClick={(e) => e.stopPropagation()}>
              <p className="text-white text-lg md:text-2xl font-black italic tracking-tight">"{photos[currentIndex].caption}"</p>
              <p className="text-pink-300 text-[10px] md:text-xs mt-2 font-bold uppercase tracking-widest">📅 {formatDate(photos[currentIndex].created_at)}</p>
              
              {user?.role === 'admin' && (
                <div className="mt-4 flex justify-center gap-4 border-t border-white/10 pt-4">
                  <button onClick={(e) => handleEditCaption(e, photos[currentIndex])} className="text-[10px] text-blue-300 uppercase">Sửa</button>
                  <button onClick={(e) => handleDelete(e, photos[currentIndex].id)} className="text-[10px] text-red-400 uppercase">Xóa</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .break-inside-avoid { break-inside: avoid; }
        @keyframes popIn { 0% { transform: scale(0.9) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-popIn { animation: popIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default Gallery;