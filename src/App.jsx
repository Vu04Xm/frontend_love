import React, { useState, useEffect, useRef } from 'react';
import api from './api';
import Login from './Login';
import Counter from './Counter';
import FlowerOverlay from './FlowerOverlay';
import Memories from './Memories';
import Gallery from './Gallery';
import Places from './Places';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('counter');
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && activeTab === 'memories') {
      fetchMemories();
    }
  }, [isLoggedIn, activeTab]);

  const onLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (audioRef.current) audioRef.current.play().catch(e => console.log("Audio play deferred:", e));
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có muốn đăng xuất?")) {
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/memories');
      setMemories(res.data);
    } catch (err) {
      console.error("Lỗi fetch memories:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return <Login onLoginSuccess={onLoginSuccess} />;

  const menuItems = [
    { id: 'counter', label: 'Đếm ngày', icon: '⏳' },
    { id: 'memories', label: 'Kỷ niệm', icon: '📖' },
    { id: 'gallery', label: 'Ảnh', icon: '📸' },
    { id: 'places', label: 'Nơi đã qua', icon: '📍' }
  ];

  return (
    <div className="min-h-screen bg-[#fff5f7] flex flex-col md:flex-row font-sans transition-all duration-500">
      <FlowerOverlay />
      <audio ref={audioRef} src="/motdoi.mp3" loop />

      {/* --- SIDEBAR (Desktop) / BOTTOM NAV (Mobile) --- */}
      <aside className="
        fixed z-50 transition-all duration-300 shadow-2xl
        /* Mobile: Dưới đáy */
        bottom-0 left-0 w-full h-16 bg-white/90 backdrop-blur-lg border-t border-pink-100 flex flex-row
        /* Desktop: Bên trái */
        md:top-0 md:left-0 md:h-screen md:w-64 md:flex-col md:border-r md:border-t-0
      ">
        {/* Logo - Chỉ hiện trên Desktop */}
        <div className="hidden md:flex p-6 mb-4 items-center gap-3 cursor-pointer" onClick={() => setActiveTab('counter')}>
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-xl animate-pulse">💖</span>
          </div>
          <span className="text-xl font-black text-pink-500 tracking-tighter italic">LoveDiary</span>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-1 md:flex-col justify-around md:justify-start px-2 md:px-4 md:space-y-2 py-2 md:py-0">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex flex-col md:flex-row items-center gap-1 md:gap-4 px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl transition-all duration-300
                ${activeTab === item.id 
                  ? 'bg-pink-100 md:bg-gradient-to-r md:from-pink-400 md:to-rose-400 text-pink-600 md:text-white shadow-sm md:shadow-lg md:translate-x-1' 
                  : 'text-pink-300 hover:bg-pink-50 hover:text-pink-500'
                }
              `}
            >
              <span className="text-lg md:text-xl">{item.icon}</span>
              <span className="text-[10px] md:text-sm font-bold uppercase md:capitalize">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Action Buttons - Nhạc & Logout */}
        <div className="hidden md:flex p-4 border-t border-pink-50 flex-col gap-2 bg-white/50">
          <button 
            onClick={() => {
              const audio = audioRef.current;
              if (audio) audio.paused ? audio.play() : audio.pause();
            }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-pink-400 hover:bg-pink-100 transition-all"
          >
            <span className="text-xl">🎵</span>
            <span className="font-bold text-sm">Nhạc nền</span>
          </button>
          
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-rose-300 hover:bg-rose-50 transition-all"
          >
            <span className="text-xl">🚪</span>
            <span className="font-bold text-sm">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* --- NỘI DUNG CHÍNH --- */}
      <main className="
        flex-1 
        /* Mobile: Cách đáy để không bị Bottom Nav đè */
        mb-20 px-4 py-6
        /* Desktop: Cách trái */
        md:ml-64 md:p-10 md:mb-0
      ">
        {/* Nút Logout nhanh cho Mobile (vì sidebar đã ẩn nút này) */}
        <div className="md:hidden flex justify-end mb-4">
            <button onClick={handleLogout} className="text-pink-300 text-sm font-medium">Đăng xuất 🚪</button>
        </div>

        <div className="max-w-6xl mx-auto">
          {activeTab === 'counter' && (
            <div className="min-h-[70vh] md:min-h-[80vh] flex items-center justify-center animate-fadeIn">
              <Counter user={user} />
            </div>
          )}
          {activeTab === 'memories' && (
            <Memories memories={memories} fetchMemories={fetchMemories} loading={loading} user={user} />
          )}
          {activeTab === 'gallery' && <Gallery user={user} />}
          {activeTab === 'places' && <Places user={user} />}
        </div>
      </main>
    </div>
  );
}

export default App;