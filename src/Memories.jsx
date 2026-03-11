import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Memories({ memories, fetchMemories, loading, user }) {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // States xem album chi tiết
  const [selectedMem, setSelectedMem] = useState(null);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [isViewing, setIsViewing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    event_date: '',
    image_files: []
  });

  const handleOpenAlbum = async (m) => {
    setSelectedMem(m);
    setIsViewing(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/memories/${m.id}/photos`);
      setAlbumPhotos(res.data);
    } catch (err) { console.error("Lỗi:", err); }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ title: '', content: '', event_date: '', image_files: [] });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('event_date', formData.event_date);
    formData.image_files.forEach(file => data.append('images', file));

    try {
      await axios.post('http://localhost:5000/api/memories', data);
      setShowModal(false);
      fetchMemories();
      alert("Đã ghi lại kỷ niệm! ❤️");
    } catch (err) { alert("Lỗi lưu trữ!"); } 
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Xóa nhé? 😢")) {
      await axios.delete(`http://localhost:5000/api/memories/${id}`);
      fetchMemories();
    }
  };

  return (
    <div className="animate-fadeIn pb-20 px-4 md:px-0">
      {/* --- HEADER --- */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tighter">Nhật Ký Tình Yêu</h2>
          <p className="text-pink-400 font-medium italic text-sm md:text-base">"Mỗi ngày bên nhau là một món quà..."</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={handleOpenAdd} className="bg-pink-500 text-white px-5 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2 text-sm md:text-base">
            ✍️ Viết kỷ niệm
          </button>
        )}
      </header>

      {/* --- DANH SÁCH KỶ NIỆM --- */}
      {loading ? (
        <div className="text-center py-20 text-pink-300 animate-pulse font-bold">Đang lục lại ký ức...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memories.map((m, index) => (
            <div 
              key={m.id} 
              onClick={() => handleOpenAlbum(m)}
              className="animate-item bg-white rounded-[2.5rem] p-4 shadow-sm cursor-pointer border-4 border-white relative transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-56 rounded-[2rem] overflow-hidden mb-6 relative">
                <img src={m.cover_image || 'https://via.placeholder.com/400x300'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white/30 backdrop-blur-md text-white px-5 py-2 rounded-full text-xs font-black shadow-lg">XEM ALBUM ✨</span>
                </div>
              </div>
              <div className="px-4 pb-4">
                <span className="text-pink-400 font-black text-[10px] tracking-widest uppercase bg-pink-50 px-3 py-1 rounded-full">{new Date(m.event_date).toLocaleDateString('vi-VN')}</span>
                <h4 className="text-xl font-black text-gray-800 mt-3 mb-2 group-hover:text-pink-500 transition-colors">{m.title}</h4>
                <p className="text-gray-400 text-sm italic line-clamp-2 leading-relaxed">{m.content}</p>
              </div>
              {user?.role === 'admin' && (
                <button onClick={(e) => handleDelete(e, m.id)} className="absolute top-6 right-6 w-8 h-8 bg-white/90 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL XEM ALBUM (Masonry) --- */}
      {isViewing && selectedMem && (
        <div className="fixed inset-0 z-[200] bg-white/98 backdrop-blur-2xl overflow-y-auto animate-fadeIn">
          <button onClick={() => setIsViewing(false)} className="fixed top-6 right-6 md:top-8 md:right-8 w-12 h-12 flex items-center justify-center bg-pink-500 text-white rounded-full shadow-xl z-[201]">✕</button>
          <div className="max-w-5xl mx-auto py-20 px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">{selectedMem.title}</h2>
              <p className="text-pink-500 font-bold mb-8 italic">📅 {new Date(selectedMem.event_date).toLocaleDateString('vi-VN')}</p>
              <div className="bg-white p-6 md:p-10 rounded-[2.5rem] text-gray-600 text-lg italic leading-relaxed whitespace-pre-wrap shadow-sm border border-pink-50">"{selectedMem.content}"</div>
            </div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {albumPhotos.map((img, idx) => (
                <div key={img.id} className="animate-item break-inside-avoid rounded-3xl overflow-hidden border-4 border-white shadow-lg" style={{ animationDelay: `${idx * 0.08}s` }}>
                   <img src={img.photo_url} className="w-full h-auto block" alt="" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL FORM (Chống Tràn Tuyệt Đối) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white p-6 md:p-8 rounded-[3rem] w-full max-w-md shadow-2xl border-4 border-pink-50 flex flex-col max-h-[90vh] overflow-hidden animate-scaleIn"
          >
            {/* Header Form - Không cuộn */}
            <h3 className="text-2xl font-black text-gray-800 mb-6 text-center uppercase tracking-tighter shrink-0">⚓ Ghi Lại Kỷ Niệm</h3>
            
            {/* Body Form - Có thể cuộn nếu quá dài */}
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
              <div>
                <label className="text-[10px] font-bold text-pink-400 ml-4 uppercase">Tiêu đề</label>
                <input type="text" placeholder="Kỷ niệm ngày..." required className="w-full p-4 rounded-2xl bg-pink-50/20 border-2 border-transparent focus:border-pink-200 outline-none transition-all" onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-pink-400 ml-4 uppercase">Nội dung</label>
                <textarea placeholder="Chuyện gì đã xảy ra..." required className="w-full p-4 rounded-2xl bg-pink-50/20 border-2 border-transparent focus:border-pink-200 outline-none transition-all h-24 resize-none" onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-pink-400 ml-4 uppercase">Ngày tháng</label>
                <input type="date" required className="w-full p-4 rounded-2xl bg-pink-50/20 border-2 border-transparent focus:border-pink-200 outline-none transition-all" onChange={e => setFormData({...formData, event_date: e.target.value})} />
              </div>
              <div className="p-6 border-2 border-dashed border-pink-100 rounded-[2rem] text-center hover:bg-pink-50 transition-all cursor-pointer relative">
                <input type="file" multiple accept="image/*" className="hidden" id="file-upload" onChange={e => setFormData({...formData, image_files: Array.from(e.target.files)})} />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <span className="text-2xl block mb-1">📸</span>
                  <span className="text-pink-500 font-black text-[10px] uppercase block">
                    {formData.image_files.length > 0 ? `Đã chọn ${formData.image_files.length} ảnh` : "Tải lên album ảnh"}
                  </span>
                </label>
              </div>
            </div>

            {/* Footer Form - Không cuộn */}
            <div className="flex gap-4 mt-6 shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 font-bold text-gray-400 py-3">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-pink-500 text-white rounded-2xl font-black shadow-xl disabled:opacity-50">
                {isSubmitting ? 'ĐANG LƯU...' : 'LƯU LẠI ❤️'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Memories;