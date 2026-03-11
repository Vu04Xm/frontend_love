import React, { useState, useEffect } from 'react';

function Counter({ user }) {
  const startDate = new Date('2023-03-18T00:00:00');

  // State lưu con số hiển thị (số đang nhảy)
  const [displayTime, setDisplayTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // State lưu con số thực tế (đích đến)
  const [actualTime, setActualTime] = useState(null);

  // 1. Hàm tính toán thời gian thực tế
  const calculateActualTime = () => {
    const now = new Date();
    const diff = now - startDate;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  };

  // 2. Hiệu ứng "Xổ số" khi vừa load tab
  useEffect(() => {
    const target = calculateActualTime();
    setActualTime(target);

    let startTimestamp = null;
    const duration = 6000; // Chạy trong 2 giây

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Công cụ làm mượt (Ease Out Quad) - Chạy nhanh rồi chậm dần về đích
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setDisplayTime({
        days: Math.floor(easeProgress * target.days),
        hours: Math.floor(easeProgress * target.hours),
        minutes: Math.floor(easeProgress * target.minutes),
        seconds: Math.floor(easeProgress * target.seconds)
      });

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);

    // Sau khi chạy xong hiệu ứng 2s, bắt đầu chạy đồng hồ thực tế mỗi giây
    const timer = setInterval(() => {
      const now = calculateActualTime();
      setDisplayTime(now);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-6 animate-fadeIn transition-all">
      
      {/* BOX HỒNG CHÍNH */}
      <div className="relative group w-full max-w-[22rem] sm:max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        
        <div className="relative bg-gradient-to-br from-pink-500 to-rose-500 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl text-center text-white border border-white/20">
          
          <h2 className="text-white/70 font-bold uppercase tracking-[0.2em] text-[8px] sm:text-[10px] mb-4">
            Our Love Timeline
          </h2>

          {/* SỐ NGÀY NHẢY NHƯ XỔ SỐ */}
          <div className="relative inline-block mb-6">
            <span className="text-7xl sm:text-8xl md:text-9xl font-black drop-shadow-xl tabular-nums leading-none tracking-tighter">
              {displayTime.days.toLocaleString()}
            </span>
            <div className="absolute -right-8 sm:-right-10 bottom-1 sm:bottom-2 text-sm sm:text-lg font-black italic text-pink-200">DAYS</div>
          </div>

          {/* ĐỒNG HỒ MINI CŨNG NHẢY */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { label: 'Hrs', value: displayTime.hours },
              { label: 'Min', value: displayTime.minutes },
              { label: 'Sec', value: displayTime.seconds }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 py-2 sm:py-3 rounded-2xl flex flex-col items-center justify-center">
                <p className="text-xl sm:text-2xl md:text-3xl font-black tabular-nums leading-none">
                  {item.value < 10 ? `0${item.value}` : item.value}
                </p>
                <p className="text-[7px] sm:text-[9px] uppercase font-bold text-white/50 tracking-widest mt-1">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOX TRẠNG THÁI */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-[22rem] sm:max-w-md mt-6">
        <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl shadow-sm border border-pink-50 flex items-center justify-center gap-2 sm:gap-3">
          <span className="text-lg sm:text-xl">📅</span>
          <div className="text-left">
            <p className="text-[7px] sm:text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Since</p>
            <p className="text-xs sm:text-sm font-black text-pink-500 tracking-tight">18.03.2023</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl shadow-sm border border-pink-50 flex items-center justify-center gap-2 sm:gap-3">
          <span className="text-lg sm:text-xl animate-pulse">💍</span>
          <div className="text-left">
            <p className="text-[7px] sm:text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Status</p>
            <p className="text-xs sm:text-sm font-black text-pink-500 italic tracking-tight">Forever</p>
          </div>
        </div>
      </div>

      <p className="mt-8 text-[8px] sm:text-[10px] text-gray-300 font-medium tracking-[0.4em] uppercase text-center">
        ✨ Love is a journey, not a destination ✨
      </p>
    </div>
  );
}

export default Counter;