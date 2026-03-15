import React, { useState, useRef } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Tạo mảng ngẫu nhiên cho hoa và tim rơi
  const floatingItems = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: `${Math.random() * 5 + 5}s`,
    delay: `${Math.random() * 5}s`,
    size: `${Math.random() * 1.5 + 1}rem`,
    content: ['❤️', '🌸', '💖', '✨', '🌹'][Math.floor(Math.random() * 5)]
  }));

  const toggleMusic = () => {
    if (isPlaying) { audioRef.current.pause(); } 
    else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    try {
      const res = await axios.post('http://localhost:5000/api/login', { username, password });
      if (res.data.success) { onLoginSuccess(res.data.user); }
    } catch (err) {
      alert(err.response?.data?.message || "Đăng nhập thất bại!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-200 to-red-200 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* HIỆU ỨNG TRÁI TIM & HOA RƠI */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingItems.map((item) => (
          <span
            key={item.id}
            className="animate-fall opacity-60"
            style={{
              left: item.left,
              animationDuration: item.duration,
              animationDelay: item.delay,
              fontSize: item.size,
              top: '-5%'
            }}
          >
            {item.content}
          </span>
        ))}
      </div>

      

      {/* Trình phát nhạc ẩn */}
      <audio ref={audioRef} src="/motdoi.mp3" loop />

      <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(255,117,143,0.4)] w-full max-w-md border border-white/40 relative z-10 text-center">
        
        {/* Nút bật/tắt nhạc */}
        <button 
          onClick={toggleMusic}
          className={`absolute -top-4 -right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 z-20 ${isPlaying ? 'bg-pink-500 animate-spin-slow' : 'bg-gray-400 rotate-12'}`}
        >
          <span className="text-2xl">{isPlaying ? '🎵' : '🔇'}</span>
        </button>

        <div className="mb-6">
          <div className="inline-block p-4 bg-pink-100 rounded-full mb-4 shadow-inner">
            <span className="text-4xl animate-pulse inline-block">💑</span>
          </div>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500 font-serif">
            Love Box
          </h2>
          <p className="text-pink-400 font-medium italic mt-2 text-sm uppercase tracking-widest">
            Together Forever
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="group">
            <input 
              name="username" 
              type="text" 
              placeholder="Tên đăng nhập" 
              required 
              className="w-full p-4 bg-white/60 border-2 border-pink-100 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all placeholder:text-pink-300 shadow-sm"
            />
          </div>
          
          <div className="group">
            <input 
              name="password" 
              type="password" 
              placeholder="Mật khẩu của chúng mình" 
              required 
              className="w-full p-4 bg-white/60 border-2 border-pink-100 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all placeholder:text-pink-300 shadow-sm"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-pink-300 shadow-lg transform hover:-translate-y-1 transition-all duration-300 active:scale-95"
          >
            Đăng nhập ngay ❤️
          </button>
        </form>

        <p className="mt-8 text-xs text-pink-300 flex justify-center items-center gap-2">
          <span className="h-px w-8 bg-pink-200"></span>
          Được làm bằng cả trái tim
          <span className="h-px w-8 bg-pink-200"></span>
        </p>
      </div>
    </div>
  );
}

export default Login;