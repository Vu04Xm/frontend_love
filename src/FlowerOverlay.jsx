import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HeartOverlay = () => {
  const [elements, setElements] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Tạo hiệu ứng rơi liên tục
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      // Danh sách các loại hình trái tim và hoa
      const icons = ['❤️', '💖', '💗', '💓', '💕', '🌸', '🌹', '🌷']; 
      
      const newElement = {
        id,
        text: icons[Math.floor(Math.random() * icons.length)],
        left: Math.random() * 100 + "%",
        duration: Math.random() * 5 + 7 + "s", // Thời gian rơi từ 7-12s
        size: Math.random() * 20 + 15 + "px", // Kích thước từ 15px - 35px
        opacity: Math.random() * 0.5 + 0.4,   // Độ mờ nhẹ nhàng
        rotation: Math.random() * 360 + "deg" // Góc xoay ban đầu
      };

      // Giữ tối đa 20 phần tử trên màn hình để đảm bảo hiệu suất
      setElements((prev) => [...prev.slice(-19), newElement]);
    }, 1500); // Cứ 1.5 giây tạo ra 1 hình mới

    return () => clearInterval(interval);
  }, []);

  // Hàm xử lý khi click vào trái tim để lấy ảnh từ Cloudinary
  const handleIconClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Gọi API lấy ảnh ngẫu nhiên từ backend của bạn
   const res = await axios.get(
  "https://backend-love.onrender.com/api/memories/random"
);
      if (res.data && res.data.image_url) {
        setSelectedImg(res.data.image_url);
      }
    } catch (err) {
      console.error("Lỗi lấy ảnh ngẫu nhiên:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* LỚP TRÁI TIM RƠI */}
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
        {elements.map((el) => (
          <div
            key={el.id}
            onClick={(e) => {
              e.stopPropagation();
              handleIconClick();
            }}
            className="absolute top-[-10%] animate-fall pointer-events-auto cursor-pointer hover:scale-150 transition-transform duration-300 select-none"
            style={{
              left: el.left,
              fontSize: el.size,
              opacity: el.opacity,
              animationDuration: el.duration,
              '--start-rotate': el.rotation
            }}
          >
            {el.text}
          </div>
        ))}
      </div>

      {/* MODAL HIỂN THỊ ẢNH KHI CLICK TRÚNG */}
      {selectedImg && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setSelectedImg(null)}
        >
          <div 
            className="relative max-w-sm w-full bg-white p-3 rounded-[2.5rem] shadow-2xl animate-popIn border-4 border-pink-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-[2rem]">
              <img src={selectedImg} className="w-full h-auto object-cover max-h-[60vh]" alt="Secret Moment" />
            </div>
            <p className="text-center py-4 font-bold text-pink-500 italic">
              💝 Một kỷ niệm bất ngờ dành cho bạn!
            </p>
            <button 
              onClick={() => setSelectedImg(null)}
              className="absolute -top-2 -right-2 bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-rose-500 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* CSS ANIMATIONS */}
      <style>{`
        @keyframes fall {
          0% { 
            transform: translateY(0) rotate(var(--start-rotate)) translateX(0); 
            opacity: 0; 
          }
          10% { opacity: 1; }
          100% { 
            transform: translateY(110vh) rotate(360deg) translateX(30px); 
            opacity: 0; 
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-popIn {
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </>
  );
};

export default HeartOverlay;