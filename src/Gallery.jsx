import React, { useState, useEffect } from 'react';
import api from './api';

// Hàm tối ưu ảnh Cloudinary - Giúp tiết kiệm băng thông tối đa
const optimizeUrl = (url, transform = 'f_auto,q_auto') => {
  if (!url) return 'https://via.placeholder.com/400x300?text=Love';
  if (!url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/${transform}/`);
};

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
    } catch (err) { 
      console.error("Lỗi lấy ảnh:", err); 
    }
  };

  useEffect(() => { fetchPhotos(); }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Không rõ thời gian";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', month: '2-digit', year: 'numeric'
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
    } catch (err) { 
      alert("Lỗi upload ảnh."); 
    } finally { 
      setUploading(false); 
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Xóa vĩnh viễn ảnh này?")) return;
    try {
      await api.delete(`/api/photos/${id}`);
      fetchPhotos();
      if (currentIndex !== null) setCurrentIndex(null);
    } catch (err) { 
      alert("Lỗi khi xóa ảnh."); 
    }
  };

  const handleEditCaption = async (e, photo) => {
    e.stopPropagation();
    const newCaption = prompt("Sửa lời nhắn:", photo.caption);
    if (newCaption === null || newCaption === photo.caption) return;
    try {
      await api.put(`/api/photos/${photo.id}`, { caption: newCaption });
      fetchPhotos();
    } catch (err) { 
      alert("Lỗi khi cập nhật."); 
    }
  };

  return (
    <div className="p-2 md:p-4 animate-fadeIn bg-[#fffcfc] min-h-screen">
      <div className="mb-6 md:mb-12 text-center pt-6">
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 tracking-tighter uppercase">Album Ảnh 📸</h2>
        <div className="w-12 h-1 bg-rose-300 mx-auto rounded-full mb-4"></div>
        <p className="text-rose-400 font-medium italic text-sm md:text-lg">"Lưu giữ từng giây phút bên nhau"</p>
      </div>

      {/* NÚT THÊM DÀNH CHO ADMIN */}
      {user?.role === 'admin' && (
        <div className="mb-10 flex justify-center">
          <button 
            onClick={() => setShowUploadForm(true)}
            className="group relative px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-rose-500 transition-all duration-300 active:scale-95"
          >
            <span className="relative z-10">➕ Thêm khoảnh khắc mới</span>
          </button>
        </div>
      )}

      {/* MODAL UPLOAD ẢNH */}
      {showUploadForm && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 animate-fadeIn">
          <form 
            onSubmit={handleFormSubmit}
            className="bg-white w-full md:max-w-md rounded-t-[2.5rem] md:rounded-[3rem] p-8 shadow-2xl animate-popIn border-t-8 border-rose-400 md:border-8"
          >
            <h3 className="text-2xl font-black text-gray-800 mb-8 text-center uppercase tracking-tight">Tải lên kỷ niệm ✨</h3>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Chọn tệp ảnh</label>
                <input 
                  type="file" accept="image/*"
                  onChange={(e) => setNewPhoto({...newPhoto, file: e.target.files[0]})}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-rose-500 file:text-white file:font-bold cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Lời nhắn gửi</label>
                <input 
                  type="text" placeholder="Ghi chú cho bức ảnh này..."
                  value={newPhoto.caption}
                  onChange={(e) => setNewPhoto({...newPhoto, caption: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-rose-200 outline-none transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Ngày kỷ niệm</label>
                <input 
                  type="date" value={newPhoto.date}
                  onChange={(e) => setNewPhoto({...newPhoto, date: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-rose-200 outline-none text-sm font-bold"
                />
              </div>
            </div>
            <div className="mt-10 flex gap-4 pb-6 md:pb-0">
              <button type="button" onClick={() => setShowUploadForm(false)} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors">ĐÓNG</button>
              <button type="submit" disabled={uploading} className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg shadow-rose-200 active:scale-95 transition-all">
                {uploading ? "ĐANG TẢI..." : "LƯU KỶ NIỆM"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GRID ẢNH MASONRY TỐI ƯU BĂNG THÔNG */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 md:gap-5 space-y-3 md:space-y-5">
        {photos.map((p, index) => (
          <div 
            key={p.id} 
            onClick={() => setCurrentIndex(index)}
            className="relative group rounded-2xl md:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border-2 md:border-4 border-white cursor-pointer break-inside-avoid animate-popIn"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Thumbnail: Ép về độ rộng 600px để load cực nhanh */}
            <img 
              src={optimizeUrl(p.image_url, 'w_600,c_limit,f_auto,q_auto')} 
              alt="" 
              className="w-full h-auto block transform group-hover:scale-110 transition-transform duration-1000" 
              loading="lazy" 
            />
            
            {/* Nút điều khiển Admin */}
            {user?.role === 'admin' && (
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={(e) => handleEditCaption(e, p)} className="bg-white/95 backdrop-blur-sm p-2 rounded-xl text-blue-500 shadow-xl hover:bg-blue-500 hover:text-white transition-colors">✏️</button>
                <button onClick={(e) => handleDelete(e, p.id)} className="bg-white/95 backdrop-blur-sm p-2 rounded-xl text-red-500 shadow-xl hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
              </div>
            )}

            {/* Overlay Caption */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 md:p-6">
               <p className="text-white text-xs md:text-sm font-bold mb-2 line-clamp-3 italic leading-relaxed">"{p.caption}"</p>
               <p className="text-rose-300 text-[9px] md:text-[10px] font-black tracking-widest uppercase">✨ {formatDate(p.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL XEM ẢNH FULL SIZE */}
      {currentIndex !== null && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-3 md:p-6 animate-fadeIn" onClick={() => setCurrentIndex(null)}>
          <button className="absolute top-6 right-6 text-white/40 hover:text-white text-4xl transition-colors" onClick={() => setCurrentIndex(null)}>&times;</button>
          
          <div className="relative max-w-6xl w-full flex flex-col items-center">
            {/* Full-size: Chỉ tải khi cần xem to (Giới hạn 1600px cho nét) */}
            <img 
              src={optimizeUrl(photos[currentIndex].image_url, 'w_1600,c_limit,f_auto,q_auto')} 
              className="max-w-full max-h-[70vh] md:max-h-[80vh] rounded-2xl md:rounded-[2.5rem] shadow-2xl animate-zoomIn object-contain border-4 border-white/10" 
              onClick={(e) => e.stopPropagation()} 
            />
            
            <div className="mt-6 md:mt-10 bg-white/5 backdrop-blur-lg px-8 py-6 md:px-12 md:py-8 rounded-[2rem] md:rounded-[4rem] border border-white/10 text-center w-full max-w-2xl mx-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <p className="text-white text-xl md:text-3xl font-black italic tracking-tight leading-snug">"{photos[currentIndex].caption}"</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="h-px w-8 bg-rose-400"></span>
                <p className="text-rose-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">📅 {formatDate(photos[currentIndex].created_at)}</p>
                <span className="h-px w-8 bg-rose-400"></span>
              </div>
              
              {user?.role === 'admin' && (
                <div className="mt-6 flex justify-center gap-6 border-t border-white/5 pt-6">
                  <button onClick={(e) => handleEditCaption(e, photos[currentIndex])} className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest">Sửa lời nhắn</button>
                  <button onClick={(e) => handleDelete(e, photos[currentIndex].id)} className="text-[10px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest">Xóa ảnh này</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .break-inside-avoid { break-inside: avoid; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0.95) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-popIn { animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-zoomIn { animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}

export default Gallery;