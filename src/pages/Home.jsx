import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, Compass, Star, Heart, Loader2, LogOut, LogIn, Trash2, RotateCcw, Box, X, ShieldCheck, Bookmark, Layout, RefreshCcw, Settings, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// Hum yahan abhi bhi baaki strings ke liye config.js use kar sakte hain 
// Lekin SHEET_API_URL niche hum direct .env se le rahe hain.
import { ADMIN_EMAILS, DELETE_ACCESS, SEARCH_PLACEHOLDER, APP_HEADER, TOUR_TYPES, TOUR_TYPE_COLORS } from '../config';

// ✅ ENVIRONMENT VARIABLES CONNECTION
const SHEET_API_URL = import.meta.env.VITE_SHEET_API_URL;

// --- SLIDER COMPONENT ---
const ImageSlider = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const fallback = "https://i.pinimg.com/736x/04/35/c4/0435c4cc66061a2c05a63489b77480a0.jpg";

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => setCurrent(p => (p === images.length - 1 ? 0 : p + 1)), 3500);
    return () => clearInterval(timer);
  }, [images]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-200">
      {images.map((img, i) => (
        <motion.img
          key={i} src={img || null}
          onError={(e) => { e.target.src = fallback; }}
          initial={{ opacity: 0 }} animate={{ opacity: i === current ? 1 : 0 }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ scale: i === current ? 1.1 : 1, transition: 'all 3s linear' }}
          alt="tour"
        />
      ))}
      {images.length > 1 && (
        <div className="absolute top-2 left-0 right-0 flex gap-0.5 px-3 z-20">
          {images.map((_, i) => (<div key={i} className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden"><div className={`h-full bg-white transition-all duration-[3500ms] linear ${i === current ? 'w-full' : 'w-0'}`} /></div>))}
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  
  // --- STATES ---
  const [tours, setTours] = useState([]);
  const [trashCount, setTrashCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState("Detecting...");
  const [coords, setCoords] = useState({ lat: 19.0760, lon: 72.8777 }); 
  const [loadingLoc, setLoadingLoc] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("live");
  const [favorites, setFavorites] = useState([]);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  // --- 🔐 PERMISSIONS ---
  const isDeleteAdmin = useMemo(() => user && DELETE_ACCESS.split(',').map(e => e.trim().toLowerCase()).includes(user.email.toLowerCase()), [user]);
  const isAdmin = useMemo(() => ADMIN_EMAILS === "*" || (user && ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).includes(user.email.toLowerCase())), [user]);

  // --- 📡 CLOUD LOGIC ---
  const loadData = async (mode) => {
    setViewMode(mode);
    setShowProfileDetails(false);
    if (mode === "map" || mode === "saved") { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await fetch(`${SHEET_API_URL}?mode=${mode === 'trash' ? 'trash' : 'live'}`);
      const data = await res.json();
      setTours(Array.isArray(data) ? data : []);
    } catch (err) { setTours([]); }
    finally { setLoading(false); }
  };

  const fetchLoc = () => {
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lon: longitude });
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const d = await res.json();
        const area = d.address.suburb || d.address.neighbourhood || "";
        setLocation(`${area}${area ? ', ' : ''}${d.address.city || "Mumbai"}`);
      } catch (e) { setLocation("Mumbai, MH"); }
      setLoadingLoc(false);
    }, () => { setLocation("Permission Denied"); setLoadingLoc(false); });
  };

  const fetchTrashCount = async () => {
    try {
      const res = await fetch(`${SHEET_API_URL}?mode=trash`);
      const data = await res.json();
      setTrashCount(data.length || 0);
    } catch (e) { setTrashCount(0); }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    loadData("live");
    fetchLoc();
    fetchTrashCount();
  }, []);

  useEffect(() => {
    if (user) setFavorites(JSON.parse(localStorage.getItem(`favs_${user.email}`)) || []);
  }, [user]);

  // Filtering
  const filtered = useMemo(() => {
    let list = viewMode === "saved" ? tours.filter(t => favorites.includes(t.id)) : tours;
    return (list || []).filter(t => 
        (activeTab === "All" || t.type === activeTab) && 
        (t.name?.toLowerCase().includes(search.toLowerCase()) || t.loc?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [activeTab, search, tours, viewMode, favorites]);

  // Actions
  const handleDelete = async (e, id) => {
    e.stopPropagation(); if (!window.confirm("Move to trash?")) return; setLoading(true);
    await fetch(SHEET_API_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', id: id }) });
    loadData("live"); fetchTrashCount();
  };

  const handleRestore = async (e, id) => {
    e.stopPropagation(); setLoading(true);
    await fetch(SHEET_API_URL, { method: 'POST', body: JSON.stringify({ action: 'restore', id: id }) });
    loadData("trash"); fetchTrashCount();
  };

  const handleRestoreAll = async () => {
    if (!window.confirm(`Restore all ${trashCount} places?`)) return; setLoading(true);
    await fetch(SHEET_API_URL, { method: 'POST', body: JSON.stringify({ action: 'restore_all' }) });
    loadData("live"); fetchTrashCount();
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation(); if (!user) { setShowLoginGate(true); return; }
    let updatedFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(updatedFavs);
    localStorage.setItem(`favs_${user.email}`, JSON.stringify(updatedFavs));
  };

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-slate-900">

      {/* --- HEADER (AS PER PREVIOUS ORIGINAL UI) --- */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-3 flex justify-between items-center border-b border-gray-100 shadow-sm">
        <div className="flex flex-col gap-0.5 group cursor-pointer leading-tight" onClick={fetchLoc}>
          <h1 className="font-black text-[13px] uppercase tracking-tighter text-slate-800 leading-none">{APP_HEADER}</h1>
          <div className="flex items-center text-blue-600 font-bold leading-none mt-1">
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
            {loadingLoc ? <Loader2 size={10} className="animate-spin" /> : 
            <span className="text-[10px] font-black truncate max-w-[130px] uppercase">{location}</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && viewMode === 'live' && (
            <button onClick={() => navigate('/admin/add')} className="text-[9px] font-black text-blue-600 uppercase border-b-2 border-blue-50">Add Place</button>
          )}
          <div onClick={() => user ? setShowProfileDetails(true) : navigate('/login')} className="flex items-center gap-2 cursor-pointer transition-all active:scale-90 group">
            {user && (
              <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] font-black uppercase text-slate-900">{user.given_name || user.name.split(' ')[0]}</span>
                <span className="text-[8px] font-bold text-blue-600 uppercase mt-1 opacity-60 tracking-tighter">{user.family_name || "MEMBER"}</span>
              </div>
            )}
            <div className="h-9 w-9 rounded-full bg-blue-50 border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
              {user ? <img src={user.picture} className="w-full h-full object-cover" alt="dp" referrerPolicy="no-referrer" /> : <LogIn size={16} className="text-blue-600" />}
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN BODY --- */}
      <main className="max-w-6xl mx-auto px-4 pt-6">

        {viewMode === "map" ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-[72vh] animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-4 px-2">
               <h2 className="text-sm font-black uppercase flex items-center gap-2 text-blue-600"><Compass className="animate-spin-slow"/> Live Radar Radar</h2>
               <button onClick={() => setViewMode('live')} className="text-[9px] font-black uppercase text-gray-400 bg-white border px-3 py-1 rounded-xl shadow-sm active:bg-blue-600 active:text-white transition-all">Close Map</button>
            </div>
            <div className="flex-1 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl relative bg-slate-50">
              <iframe width="100%" height="100%" frameBorder="0" scrolling="no" title="live-map"
                src={`https://maps.google.com/maps?q=${coords.lat},${coords.lon}&z=14&output=embed`} />
            </div>
          </motion.div>
        ) : (
          <>
            {viewMode === "trash" && <div className="mb-4 flex items-center justify-between px-2 bg-orange-50 p-4 rounded-3xl border border-orange-100 shadow-inner"><div className="flex items-center gap-2 text-orange-600 font-black uppercase text-xs"><Trash2 size={18} />Recycle Bin ({trashCount})</div><button onClick={handleRestoreAll} className="text-[10px] font-black uppercase bg-orange-600 text-white px-5 py-2.5 rounded-xl shadow-lg active:scale-95">Restore All</button></div>}
            {viewMode === "saved" && <div className="mb-6 flex items-center gap-2 text-red-600 border-l-4 border-red-500 px-3 ml-1"><Heart size={20} fill="red" /><h2 className="text-xl font-black uppercase tracking-tighter">Your Favorites</h2></div>}

            <div className="mb-4 flex items-center bg-gray-50 p-3.5 rounded-2xl border border-gray-100 shadow-sm focus-within:bg-white transition-all shadow-inner">
              <Search className="text-gray-300 mr-2" size={18} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={SEARCH_PLACEHOLDER} className="bg-transparent outline-none w-full text-xs font-black uppercase" />
            </div>

            {viewMode !== 'trash' && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 py-1 px-1">
                {TOUR_TYPES.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-xl whitespace-nowrap text-[10px] font-black uppercase transition-all shadow-sm ${activeTab === tab ? (TOUR_TYPE_COLORS[tab] || 'bg-slate-900 text-white') : 'bg-white text-gray-400 border border-gray-100'}`}>{tab}</button>
                ))}
              </div>
            )}

            {/* --- GRID DISPLAY --- */}
            {loading ? <div className="py-24 text-center flex flex-col items-center"><Loader2 className="animate-spin text-blue-600" size={32}/><p className="text-[8px] font-black text-gray-400 uppercase mt-4 tracking-widest animate-pulse">Syncing Cloud Database...</p></div> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-500">
                {filtered.map(t => (
                  <div key={t.id} onClick={() => viewMode === "live" && navigate(`/details/${t.id}`)} className="relative aspect-square rounded-[28px] overflow-hidden active:scale-[0.96] transition-all bg-white shadow-sm border border-gray-100 group">
                    <div className="w-full h-full"><ImageSlider images={t.images && t.images.length > 0 ? t.images : [t.img]} /></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-30">
                      {viewMode === "live" && isDeleteAdmin && (<button onClick={(e) => handleDelete(e, t.id)} className="h-8 w-8 bg-red-600/90 text-white rounded-lg flex items-center justify-center shadow-lg active:scale-75"><Trash2 size={12} /></button>)}
                      {viewMode === "trash" && isDeleteAdmin && (
                        <button onClick={(e) => handleRestore(e, t.id)} className="h-8 w-8 bg-blue-500/90 text-white rounded-lg flex items-center justify-center active:scale-75 transition-transform">
                          <RotateCcw size={12} />
                        </button>
                      )}
                      {viewMode !== "trash" && (<button onClick={(e) => toggleFavorite(e, t.id)} className="h-8 w-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all active:scale-125 shadow-xl"><Heart size={14} className={favorites.includes(t.id) ? "text-red-500 fill-red-500 shadow-xl" : "text-white opacity-80"} /></button>)}
                    </div>
                    <div className="absolute top-2.5 left-2.5 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100"><span className="text-[8px] font-black">{t.rating} ★</span></div>
                    <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none z-10 leading-tight">
                      <h3 className="text-[10px] md:text-xs font-black truncate uppercase tracking-tighter mb-0.5">{t.name}</h3>
                      <div className="flex justify-between items-center opacity-70">
                        <span className="text-[7px] truncate max-w-[65%] uppercase flex items-center gap-0.5"><MapPin size={6} className="text-blue-500" />{t.loc?.split(',')[0]}</span>
                        <span className="text-[10px] font-black text-blue-400">₹{t.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <p className="col-span-full py-20 text-center text-gray-300 font-black uppercase text-[10px] tracking-widest italic opacity-50">Empty Archive / No Data Found</p>}
              </div>
            )}
          </>
        )}
      </main>

      {/* --- PROFILE HUB MENU --- */}
      <AnimatePresence>
        {showProfileDetails && user && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfileDetails(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} transition={{ type: 'spring', damping: 20 }}
              className="relative w-full max-w-sm bg-white rounded-t-[40px] sm:rounded-[45px] shadow-3xl p-5 border border-white/20 overflow-hidden pb-12">
               <div className="flex items-center gap-4 mb-8 p-3 bg-slate-50 rounded-[35px] border border-gray-100 shadow-inner">
                 <img src={user.picture} className="h-16 w-16 rounded-full border-2 border-white shadow-md" referrerPolicy="no-referrer" alt="dp" />
                 <div className="flex-1 overflow-hidden leading-tight text-left">
                   <h2 className="text-xl font-black text-slate-800 truncate uppercase tracking-tighter">{user.name}</h2>
                   <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{user.email}</p>
                 </div>
                 <button onClick={() => setShowProfileDetails(false)} className="bg-white text-gray-300 h-9 w-9 rounded-full flex items-center justify-center active:text-slate-800 transition-colors shadow-sm"><X size={18}/></button>
               </div>
               <div className="space-y-1.5 px-1">
                 <button onClick={() => loadData('live')} className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all ${viewMode==='live' ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-gray-50 text-slate-700'}`}>
                    <div className="flex items-center gap-4"><Compass size={18}/><span className="text-[11px] font-black uppercase tracking-widest">Main Cloud Explore</span></div>
                    <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-lg">{tours.length}</span>
                 </button>
                 <button onClick={() => loadData('saved')} className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all ${viewMode==='saved' ? 'bg-red-500 text-white shadow-xl' : 'hover:bg-gray-50 text-slate-700'}`}>
                    <div className="flex items-center gap-4"><Heart size={18} fill={viewMode==='saved'?'white':'none'}/><span className="text-[11px] font-black uppercase tracking-widest">Saved Collection</span></div>
                    <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-lg">{favorites.length}</span>
                 </button>
                 {isDeleteAdmin && (
                    <button onClick={() => loadData('trash')} className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all ${viewMode==='trash' ? 'bg-orange-500 text-white shadow-xl' : 'hover:bg-gray-50 text-slate-700'}`}>
                       <div className="flex items-center gap-4"><Trash2 size={18}/><span className="text-[11px] font-black uppercase tracking-widest">Cloud Archive bin</span></div>
                       <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-lg">{trashCount}</span>
                    </button>
                 )}
               </div>
               <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-8 w-full bg-slate-900 text-white p-5 rounded-[22px] font-black text-[10px] uppercase shadow-xl transition-all active:scale-95 border-b-4 border-slate-700 tracking-widest uppercase">Logout Master Session</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- FOOTER NAV --- */}
      <nav className="fixed bottom-6 left-6 right-6 h-16 bg-slate-900/95 backdrop-blur-xl rounded-[28px] flex justify-around items-center px-4 shadow-2xl z-[90] max-w-sm mx-auto border border-white/10">
        <button className={viewMode === 'live' ? 'text-blue-400 scale-125' : 'text-slate-500'} onClick={() => loadData('live')}><Compass size={22} strokeWidth={3} /></button>
        <button className={viewMode === 'saved' ? 'text-red-500 scale-125' : 'text-slate-500'} onClick={() => loadData('saved')}><Heart size={22} fill={viewMode === 'saved' ? 'red' : 'none'} strokeWidth={3} /></button>
        <button className={viewMode === 'map' ? 'text-blue-300 scale-125' : 'text-slate-500'} onClick={() => loadData('map')}><MapPin size={22} strokeWidth={2.5} /></button>
        <button onClick={() => user ? setShowProfileDetails(true) : navigate('/login')} className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all bg-slate-800 ${user?'border-b-2 border-blue-400 shadow-xl':''}`}>
          {user ? <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-ping shadow-[0_0_8px_blue]" /> : <UserCircle size={22} className="text-gray-400" />}
        </button>
      </nav>

    </div>
  );
};

export default Home;
