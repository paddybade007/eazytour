import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Star, MapPin, Clock, ShieldCheck, 
  ChevronRight, ChevronLeft, Navigation, Loader2, Share2, Heart, Trash2, Edit2 
} from 'lucide-react';

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [settings, setSettings] = useState({ ADMIN_EMAILS: "", DELETE_ACCESS: "" });

  const SHEET_API_URL = import.meta.env.VITE_SHEET_API_URL;
  const RZP_KEY = import.meta.env.VITE_RZP_KEY;

  // --- 📡 DATA LOAD (Tour + Dynamic Spreadsheet Configs) ---
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      setFavorites(JSON.parse(localStorage.getItem(`favs_${u.email}`)) || []);
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Do Fetch: Ek sath Tours aur Configs mangvao
        const [tourRes, configRes] = await Promise.all([
          fetch(SHEET_API_URL),
          fetch(`${SHEET_API_URL}?mode=configs`)
        ]);

        const toursData = await tourRes.json();
        const configData = await configRes.json();

        // 1. Setup Remote Configs (Emails from sheet)
        const configMap = {};
        configData.forEach(item => { configMap[item.key] = item.value; });
        setSettings(configMap);

        // 2. Find Current Spot
        setTour(toursData.find(t => t.id.toString() === id));
      } catch (err) {
        console.error("Cloud Error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // --- 🔐 DYNAMIC PERMISSION LOGIC (Linked to Spreadsheet) ---
  const checkAccess = (listStr) => {
    if (!user || !listStr) return false;
    const allowed = listStr.split(',').map(e => e.trim().toLowerCase());
    return allowed.includes(user.email.toLowerCase());
  };

  const isAdmin = useMemo(() => settings.ADMIN_EMAILS === "*" || checkAccess(settings.ADMIN_EMAILS), [user, settings]);
  const isDeleteAdmin = useMemo(() => checkAccess(settings.DELETE_ACCESS), [user, settings]);

  if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-600 mb-2" size={32} /><p className="text-[10px] font-black uppercase text-gray-400">Linking Safar Cloud...</p></div>;
  if (!tour) return <div className="h-screen flex items-center justify-center font-black text-gray-300 uppercase tracking-widest">Destination Not Found</div>;

  const allImages = tour.images || [tour.img];
  const cleanPrice = parseInt(tour.price?.toString().replace(/,/g, '')) || 0;
  const isFree = cleanPrice === 0;

  // --- 🛠️ HANDLERS ---
  const handleShare = () => {
    if (navigator.share) navigator.share({ title: tour.name, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); alert("Copied! 🔗"); }
  };

  const toggleFavorite = () => {
    if (!user) return alert("Login to save favorites!");
    let updated = favorites.includes(tour.id) ? favorites.filter(f => f !== tour.id) : [...favorites, tour.id];
    setFavorites(updated);
    localStorage.setItem(`favs_${user.email}`, JSON.stringify(updated));
  };

  const handleDelete = async () => {
    if(!window.confirm("Move this spot to Trash bin?")) return;
    setLoading(true);
    await fetch(SHEET_API_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', id: tour.id, adminUserEmail: user?.email }) });
    navigate('/');
  };

  const handleEdit = () => navigate('/admin/add', { state: { editData: tour } });

  const handleAction = () => {
    if (isFree) window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(tour.name + ',' + tour.loc)}`, '_blank');
    else {
      if (!window.Razorpay) return alert("Net slow hai bhai!");
      const opts = { key: RZP_KEY, amount: cleanPrice * 100, currency: "INR", name: "EasyTour Cloud", description: tour.name, 
                     handler: (res) => alert("Paid Success ID: " + res.razorpay_payment_id), 
                     prefill: { name: user?.name, email: user?.email }, theme: { color: "#2563eb" } };
      new window.Razorpay(opts).open();
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <div className="flex flex-col lg:flex-row h-full min-h-screen">
        
        {/* --- LEFT: MEDIA (Fixed 50%) --- */}
        <div className="relative w-full lg:w-1/2 h-[55vh] lg:h-screen bg-slate-950 overflow-hidden lg:sticky lg:top-0">
          <AnimatePresence mode="wait">
            <motion.img key={activeImg} src={allImages[activeImg]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-full h-full object-cover" />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
          
          <div className="absolute top-6 left-5 right-5 flex justify-between z-50">
            <button onClick={() => navigate(-1)} className="h-10 w-10 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-transform"><ArrowLeft size={20}/></button>
            <div className="flex gap-2">
               {/* ✏️ EDIT - NOW DYNAMIC */}
               {isAdmin && <button onClick={handleEdit} className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:bg-blue-600"><Edit2 size={16}/></button>}
               {/* 🗑️ DELETE - NOW DYNAMIC */}
               {isDeleteAdmin && <button onClick={handleDelete} className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-red-400 border border-white/20 active:bg-red-600"><Trash2 size={16}/></button>}
               
               <button onClick={handleShare} className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20"><Share2 size={16}/></button>
               <button onClick={toggleFavorite} className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:scale-125 transition-all">
                  <Heart size={18} className={favorites.includes(tour.id) ? "fill-red-500 text-red-500" : "text-white opacity-60"}/>
               </button>
            </div>
          </div>

          {allImages.length > 1 && (
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between px-2 z-40 pointer-events-auto">
              <button onClick={(e) => { e.stopPropagation(); setActiveImg(p => (p===0 ? allImages.length-1 : p-1)); }} className="h-10 w-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white border border-white/10 active:scale-75"><ChevronLeft size={28} /></button>
              <button onClick={(e) => { e.stopPropagation(); setActiveImg(p => (p===allImages.length-1 ? 0 : p+1)); }} className="h-10 w-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white border border-white/10 active:scale-75"><ChevronRight size={28} /></button>
            </div>
          )}

          <div className="absolute bottom-10 left-6 z-40 pr-10">
            <span className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-widest mb-4 inline-block">{tour.type}</span>
            <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tighter drop-shadow-2xl">{tour.name}</h1>
            <div className="flex items-center text-white/80 font-black text-xs mt-3 uppercase tracking-widest leading-none"><MapPin size={16} className="mr-1.5 text-blue-500"/>{tour.loc}</div>
          </div>
        </div>

        {/* --- 📝 RIGHT: INFO SECTION --- */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col p-6 lg:p-14 lg:overflow-y-auto custom-scroll shadow-inner">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-1.5 text-yellow-500 font-black text-2xl drop-shadow-sm leading-none uppercase">
              <Star size={24} fill="currentColor" /> {tour.rating}
              <span className="text-gray-300 text-[10px] ml-2 font-black border-l pl-2 uppercase italic tracking-tighter">Trusted By Safar</span>
            </div>
            <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(tour.name)}`, '_blank')} 
              className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-md active:scale-90 border border-blue-100 transition-all">
              <Navigation size={24} fill="currentColor" />
            </button>
          </div>

          <div className="space-y-6 flex-grow">
            <section>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-4 flex items-center gap-2">Explore <span className="text-blue-600 italic">Senses</span></h2>
              <p className="text-slate-500 leading-relaxed font-bold text-lg opacity-80 italic leading-snug">
                {tour.desc || `Cinematic beauty of ${tour.name} awaits. A top destination in ${tour.loc} for genuine seekers of solitude and natural adrenaline.`}
              </p>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center gap-4 transition-all hover:bg-blue-50">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Clock size={20}/></div>
                <div><p className="text-[9px] font-black text-gray-400 uppercase leading-none">Vibe</p><p className="font-black text-xs text-slate-900 mt-1 uppercase">Cloud Sync</p></div>
              </div>
              <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center gap-4 transition-all hover:bg-green-50">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-green-500 shadow-sm"><ShieldCheck size={20}/></div>
                <div><p className="text-[9px] font-black text-gray-400 uppercase leading-none">Security</p><p className="font-black text-xs text-slate-900 mt-1 uppercase">Encrypted</p></div>
              </div>
            </div>
          </div>

          {/* Pricing Action Area */}
          <div className="mt-auto pt-8 border-t-2 border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 lg:pb-0">
            <div className="text-center sm:text-left flex flex-col leading-none">
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2 tracking-widest">Entry Guide</span>
              <span className="text-4xl font-black text-slate-900 leading-none tracking-tighter uppercase">
                {isFree ? <span className="text-green-600 italic">Free Base</span> : `₹${tour.price}`}
                {!isFree && <span className="text-[10px] ml-1 text-gray-300 font-bold uppercase tracking-normal">/ unit</span>}
              </span>
            </div>
            
            <button onClick={handleAction} 
              className={`w-full sm:w-auto px-12 py-5 rounded-[22px] font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-white border-b-4 ${isFree ? 'bg-green-600 shadow-green-200 border-green-800' : 'bg-blue-600 shadow-blue-200 border-blue-800'}`}>
              <Navigation size={18} fill="currentColor" />
              {isFree ? 'SHOW MAP RADAR' : 'RESERVE NOW'}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Details;






// import React, { useState, useEffect, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   ArrowLeft, Star, MapPin, Clock, ShieldCheck, 
//   ChevronRight, ChevronLeft, Navigation, Loader2, Share2, Heart, Trash2, Edit2 
// } from 'lucide-react';
// // import { DELETE_ACCESS, ADMIN_EMAILS } from '../config';

// const Details = () => {

//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [tour, setTour] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeImg, setActiveImg] = useState(0);
//   const [user, setUser] = useState(null);
//   const [favorites, setFavorites] = useState([]);

//   const SHEET_API_URL = import.meta.env.VITE_SHEET_API_URL;
//   const RZP_KEY = import.meta.env.VITE_RZP_KEY;



//   // --- 📡 DATA LOAD ---
//   useEffect(() => {
//     const savedUser = localStorage.getItem('user');
//     if (savedUser) {
//       const u = JSON.parse(savedUser);
//       setUser(u);
//       setFavorites(JSON.parse(localStorage.getItem(`favs_${u.email}`)) || []);
//     }
    
//     fetch(SHEET_API_URL)
//       .then(res => res.json())
//       .then(data => { 
//         setTour(data.find(t => t.id.toString() === id)); 
//         setLoading(false); 
//       })
//       .catch(() => setLoading(false));
//   }, [id]);

//   // --- 🔐 ADMIN PERMISSIONS ---
//   const isDeleteAdmin = useMemo(() => user && DELETE_ACCESS.split(',').map(e => e.trim().toLowerCase()).includes(user.email.toLowerCase()), [user]);
//   const isAdmin = useMemo(() => ADMIN_EMAILS === "*" || (user && ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).includes(user.email.toLowerCase())), [user]);

//   if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-600 mb-2" size={32} /><p className="text-[10px] font-black uppercase text-gray-400">Loading Safar Cloud...</p></div>;
//   if (!tour) return <div className="h-screen flex items-center justify-center font-black text-gray-300 uppercase tracking-widest">Destination Not Found</div>;

//   const allImages = tour.images || [tour.img];
//   const cleanPrice = parseInt(tour.price.toString().replace(/,/g, '')) || 0;
//   const isFree = cleanPrice === 0;

//   // --- 🛠️ FUNCTIONAL LOGIC ---

//   const handleShare = () => {
//     if (navigator.share) {
//       navigator.share({ title: tour.name, url: window.location.href }).catch(() => {});
//     } else {
//       navigator.clipboard.writeText(window.location.href);
//       alert("Share Link Copied to Clipboard! 🔗");
//     }
//   };

//   const toggleFavorite = () => {
//     if (!user) return alert("Login to save favorites!");
//     let updated = favorites.includes(tour.id) ? favorites.filter(f => f !== tour.id) : [...favorites, tour.id];
//     setFavorites(updated);
//     localStorage.setItem(`favs_${user.email}`, JSON.stringify(updated));
//   };

//   const handleDelete = async () => {
//     if(!window.confirm("Trash this destination? It can be restored from Bin later.")) return;
//     setLoading(true);
//     await fetch(SHEET_API_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', id: tour.id }) });
//     navigate('/');
//   };

//   const handleEdit = () => {
//   // navigate ke saath hum poora 'tour' object state mein bhej rahe hain
//   navigate('/admin/add', { state: { editData: tour } });
// };

//   const handleAction = () => {
//     if (isFree) window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(tour.name + ',' + tour.loc)}`, '_blank');
//     else {
//       if (!window.Razorpay) return alert("Payment SDK Error");
//       const opts = { key: RZP_KEY, amount: cleanPrice * 100, currency: "INR", name: "EasyTour Cloud", description: tour.name, 
//                      handler: (res) => alert("ID: " + res.razorpay_payment_id), 
//                      prefill: { name: user?.name, email: user?.email }, theme: { color: "#2563eb" } };
//       new window.Razorpay(opts).open();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans overflow-x-hidden">
//       <div className="flex flex-col lg:flex-row h-full min-h-screen">
        
//         {/* --- 🖼️ LEFT: MEDIA SECTION --- */}
//         <div className="relative w-full lg:w-1/2 h-[55vh] lg:h-screen bg-slate-950 overflow-hidden lg:sticky lg:top-0">
//           <AnimatePresence mode="wait">
//             <motion.img key={activeImg} src={allImages[activeImg]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-full h-full object-cover" />
//           </AnimatePresence>

//           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
          
//           {/* HEADER ACTIONS */}
//           <div className="absolute top-6 left-5 right-5 flex justify-between z-50">
//             <button onClick={() => navigate(-1)} className="h-10 w-10 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-transform"><ArrowLeft size={20}/></button>
//             <div className="flex gap-2">
//                {/* ✏️ Admin Edit Icon */}
//                {isAdmin && (
//                   <button onClick={handleEdit} className="h-10 w-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 active:bg-blue-600"><Edit2 size={16}/></button>
//                )}
//                {/* 🗑️ Admin Delete Icon */}
//                {isDeleteAdmin && (
//                   <button onClick={handleDelete} className="h-10 w-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-red-400 border border-white/20 active:bg-red-600 active:text-white"><Trash2 size={16}/></button>
//                )}
//                <button onClick={handleShare} className="h-10 w-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 active:bg-white active:text-black"><Share2 size={16}/></button>
//                <button onClick={toggleFavorite} className="h-10 w-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 active:scale-125 transition-all">
//                   <Heart size={18} className={favorites.includes(tour.id) ? "fill-red-500 text-red-500" : "text-white"}/>
//                </button>
//             </div>
//           </div>

//           {allImages.length > 1 && (
//             <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between px-2 z-40 pointer-events-none">
//               <button onClick={(e) => { e.stopPropagation(); setActiveImg(p => (p===0 ? allImages.length-1 : p-1)); }} className="h-10 w-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white border border-white/10 active:scale-75 pointer-events-auto transition-all"><ChevronLeft size={28} /></button>
//               <button onClick={(e) => { e.stopPropagation(); setActiveImg(p => (p===allImages.length-1 ? 0 : p+1)); }} className="h-10 w-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white border border-white/10 active:scale-75 pointer-events-auto transition-all"><ChevronRight size={28} /></button>
//             </div>
//           )}

//           {/* Title Area */}
//           <div className="absolute bottom-10 left-6 z-40 pr-10">
//             <span className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-[0.2em] mb-4 inline-block">{tour.type}</span>
//             <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tighter drop-shadow-2xl">{tour.name}</h1>
//             <div className="flex items-center text-white/80 font-black text-xs mt-3 uppercase"><MapPin size={16} className="mr-1.5 text-blue-500"/>{tour.loc}</div>
//           </div>
//         </div>

//         {/* --- 📝 RIGHT: INFO SECTION --- */}
//         <div className="w-full lg:w-1/2 bg-white flex flex-col p-6 lg:p-14 lg:overflow-y-auto custom-scroll">
          
//           <div className="flex justify-between items-start mb-8">
//             <div className="flex items-center gap-1.5 text-yellow-500 font-black text-2xl drop-shadow-sm">
//               <Star size={24} fill="currentColor" /> {tour.rating}
//               <span className="text-gray-300 text-[10px] ml-2 font-black border-l pl-2 uppercase italic tracking-tighter">Recommended by Cloud</span>
//             </div>
//             <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(tour.name)}`, '_blank')} 
//               className="h-11 w-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-md active:scale-90 border border-blue-100">
//               <Navigation size={22} fill="currentColor" />
//             </button>
//           </div>

//           <div className="space-y-6 flex-grow">
//             <section>
//               <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-4 flex items-center gap-2">About <span className="text-blue-600 underline underline-offset-4 decoration-blue-100 italic">Experience</span></h2>
//               <p className="text-slate-500 leading-relaxed font-bold text-lg opacity-80 italic">
//                 {tour.desc || `Vibrant lush greenery awaits you at ${tour.name}. A top-rated destination in ${tour.loc} perfect for explorers and family seekiers alike.`}
//               </p>
//             </section>

//             {/* Chips Grid */}
//             <div className="grid grid-cols-2 gap-3">
//               <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center gap-4 transition-all hover:bg-blue-50">
//                 <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Clock size={20}/></div>
//                 <div><p className="text-[9px] font-black text-gray-400 uppercase">Season</p><p className="font-black text-xs text-slate-900 leading-tight uppercase tracking-tight">Monsoon</p></div>
//               </div>
//               <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center gap-4 transition-all hover:bg-green-50">
//                 <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-green-500 shadow-sm"><ShieldCheck size={20}/></div>
//                 <div><p className="text-[9px] font-black text-gray-400 uppercase">Cloud status</p><p className="font-black text-xs text-slate-900 leading-tight uppercase tracking-tight">Verified</p></div>
//               </div>
//             </div>
//           </div>

//           {/* Pricing Action Area */}
//           <div className="mt-auto pt-8 border-t-2 border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 lg:pb-0">
//             <div className="text-center sm:text-left flex flex-col leading-none">
//               <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Cost Information</span>
//               <span className="text-4xl font-black text-slate-900 leading-none">
//                 {isFree ? <span className="text-green-600 uppercase tracking-tighter">Free Entrance</span> : `₹${tour.price}`}
//                 {!isFree && <span className="text-[10px] ml-1 text-gray-400 font-bold tracking-normal uppercase">/ spot</span>}
//               </span>
//             </div>
            
//             <button onClick={handleAction} 
//               className={`w-full sm:w-auto px-12 py-5 rounded-[22px] font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-white border-b-4 ${isFree ? 'bg-green-600 shadow-green-200 border-green-800' : 'bg-blue-600 shadow-blue-200 border-blue-800'}`}>
//               <Navigation size={18} fill="currentColor" />
//               {isFree ? 'GO TO RADAR' : 'RESERVE NOW'}
//             </button>
//           </div>
//         </div>
        
//       </div>
//     </div>
//   );
// };

// export default Details;
