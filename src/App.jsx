import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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

  // 1. Kiểm tra Login khi load trang
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // 2. Chỉ fetch Memories khi thực sự ở tab Memories
  useEffect(() => {
    if (isLoggedIn && activeTab === 'memories') {
      fetchMemories();
    }
  }, [isLoggedIn, activeTab]);

  const onLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Nhạc thường sẽ phát được ngay sau khi người dùng bấm nút "Đăng nhập" (có tương tác)
    if (audioRef.current) audioRef.current.play().catch(e => console.log(e));
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
      const res = await axios.get('http://localhost:5000/api/memories');
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
    <div className="min-h-screen bg-[#fff5f7] flex font-sans transition-all duration-500">
      <FlowerOverlay />
      
      {/* NHẠC NỀN - Để file nhạc trong public/assets/ cho chắc chắn */}
      <audio ref={audioRef} src="/motdoi.mp3" loop />

      {/* --- SIDEBAR --- */}
      <aside className="fixed left-0 top-0 h-screen w-20 md:w-64 bg-white/80 backdrop-blur-2xl border-r border-pink-100 flex flex-col z-50 transition-all duration-300 shadow-xl">
        
        <div className="p-6 mb-4 flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('counter')}>
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-xl animate-pulse">💖</span>
          </div>
          <span className="text-xl font-black text-pink-500 hidden md:block tracking-tighter italic">LoveDiary</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-lg translate-x-1' 
                : 'text-pink-300 hover:bg-pink-50 hover:text-pink-500'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold hidden md:block">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-pink-50 space-y-2 bg-white/50">
          <button 
            onClick={() => {
              const audio = audioRef.current;
              audio.paused ? audio.play() : audio.pause();
            }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-pink-400 hover:bg-pink-100 transition-all"
          >
            <span className="text-xl animate-spin-slow">🎵</span>
            <span className="font-bold hidden md:block text-sm">Nhạc nền</span>
          </button>
          
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-rose-300 hover:bg-rose-50 transition-all"
          >
            <span className="text-xl">🚪</span>
            <span className="font-bold hidden md:block text-sm">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* --- NỘI DUNG CHÍNH --- */}
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-10">
        <div className="max-w-6xl mx-auto">
          
          {activeTab === 'counter' && (
            <div className="min-h-[90vh] flex items-center justify-center animate-fadeIn">
               <Counter user={user} />
            </div>
          )}

          {activeTab === 'memories' && (
            <Memories 
              memories={memories} 
              fetchMemories={fetchMemories} 
              loading={loading} 
              user={user} 
            />
          )}

          {activeTab === 'gallery' && (
            <Gallery user={user} /> 
          )}

         {activeTab === 'places' && (
  <Places user={user} />
)}

        </div>
      </main>
    </div>
  );
}

export default App;