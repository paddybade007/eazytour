import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Info, Lock, Edit2, Camera, MapPin, Tag, Star, ShieldCheck } from 'lucide-react';

const AddTour = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // --- STATES ---
    const SHEET_API_URL = import.meta.env.VITE_SHEET_API_URL;
    const [loading, setLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true); // 🛡️ Security Lock
    const [user, setUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [settings, setSettings] = useState({ 
        ADMIN_EMAILS: "", 
        TOUR_TYPES: [] 
    });

    const [formData, setFormData] = useState({
        id: Date.now(),
        name: '',
        loc: '',
        price: '',
        rating: '4.5',
        type: '',
        desc: '',
        images: ''
    });

    // --- 📡 INITIALIZATION & SECURITY CHECK ---
    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        setUser(savedUser);

        const verifyAndInit = async () => {
            try {
                // 1. Google Sheet se Configs mangwao (Admin list + Category list)
                const res = await fetch(`${SHEET_API_URL}?mode=configs`);
                const configData = await res.json();
                
                const configMap = {};
                configData.forEach(item => { configMap[item.key] = item.value; });

                const adminList = configMap.ADMIN_EMAILS || "";
                const typesArray = configMap.TOUR_TYPES ? configMap.TOUR_TYPES.split(/,\s*/).map(t => t.trim()) : ["Waterfall", "Trekking"];

                setSettings({ ADMIN_EMAILS: adminList, TOUR_TYPES: typesArray });

                // 2. 🔐 Logic: Kya user Authorized hai?
                if (!savedUser) {
                    alert("Session expired. Please login again.");
                    navigate('/login');
                    return;
                }

                const allowedEmails = adminList.split(/,\s*/).map(e => e.trim().toLowerCase());
                const isAuthorized = adminList === "*" || allowedEmails.includes(savedUser.email.toLowerCase());

                if (!isAuthorized) {
                    alert("Unauthorized! You do not have permission to manage the cloud database.");
                    navigate('/');
                    return;
                }

                // 3. ✨ Success! Now load form if Editing
                if (location.state && location.state.editData) {
                    const d = location.state.editData;
                    setIsEditMode(true);
                    setFormData({
                        ...d,
                        images: Array.isArray(d.images) ? d.images.join('\n') : d.images
                    });
                } else {
                    // Agar naya add kar rahe hain toh default type set kardo (first category from sheet)
                    setFormData(prev => ({...prev, type: typesArray.filter(t => t !== "All")[0]}));
                }

                setIsChecking(false); // ✅ Access Granted

            } catch (error) {
                console.error("Config fetch error:", error);
                navigate('/');
            }
        };

        verifyAndInit();
    }, [navigate, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.type) return alert("Please select a category");
        
        setLoading(true);
        const payload = {
            ...formData,
            action: "save",
            adminUserEmail: user?.email || "Unknown"
        };

        try {
            await fetch(SHEET_API_URL, { method: 'POST', body: JSON.stringify(payload) });
            alert(isEditMode ? "Database Updated! ✅" : "New Spot Added to Cloud! 🚀");
            navigate('/');
        } catch (error) {
            // Google script redirection handling
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    // Jab tak settings aur permissions load ho rahi hain, tab tak Loader dikhao
    if (isChecking) return (
        <div className="h-screen bg-white flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verifying Admin Token...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FB] pb-10 font-sans text-slate-900">
            {/* --- HEADER --- */}
            <header className="px-6 py-4 bg-white sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-75 transition-all"><ArrowLeft size={20} /></button>
                    <div className="leading-tight">
                        <h1 className="text-xl font-black">{isEditMode ? "Modify Content" : "Create New Spot"}</h1>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter italic">Secured Cloud Link</p>
                    </div>
                </div>
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner">
                    <ShieldCheck size={22} />
                </div>
            </header>

            <main className="px-5 mt-6 max-w-xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-blue-50 to-blue-100 p-0.5 rounded-[28px] mb-6">
                        <div className="bg-white rounded-[27px] flex items-center gap-4 px-5 py-4 shadow-sm border border-gray-100">
                            <div className="relative group">
                                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner cursor-pointer">
                            <Info size={20} />
                        </div>
                        {/* Tooltip on hover */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-14 z-20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-xl shadow-lg whitespace-nowrap">
                            {user?.email || "No user"}
                        </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-black uppercase text-slate-800 tracking-tight leading-none mb-0.5">Cloud Admin Access</h4>
                                <p className="text-[10px] font-bold text-blue-400 truncate tracking-widest italic">{user?.email}</p>
                                <p className="text-[9px] text-slate-400 font-bold mt-1">You have permission to add or edit places in the cloud database.</p>
                            </div>
                        </div>
                    </motion.div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-5">
                        {/* Title */}
                        <div>
                            <label className="text-[9px] font-black uppercase text-gray-400 ml-1 block mb-1 tracking-widest">Destination Title</label>
                            <div className="relative">
                                <input required value={formData.name} readOnly={isEditMode} onChange={e => setFormData({ ...formData, name: e.target.value })} className={`w-full ${isEditMode ? 'bg-slate-100 text-slate-400' : 'bg-gray-50 text-slate-900'} p-4 rounded-2xl font-black text-xs outline-none border border-transparent focus:bg-white focus:border-blue-500 transition-all uppercase`} placeholder="ZENITH WATERFALL" />
                                <Lock size={12} className={`absolute right-4 top-4 text-gray-300 ${isEditMode ? 'opacity-100' : 'opacity-0'}`} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* City */}
                            <div><label className="text-[9px] font-black uppercase text-gray-400 ml-1 block mb-1 flex items-center gap-1 leading-none uppercase tracking-widest"><MapPin size={8} /> City/Area</label>
                            <input required value={formData.loc} onChange={e => setFormData({ ...formData, loc: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-xs outline-none focus:bg-white focus:border-blue-200 border border-transparent transition-all" placeholder="e.g. Khopoli" /></div>
                            
                            {/* 🔥 Category List dynamically from Settings */}
                            <div><label className="text-[9px] font-black uppercase text-gray-400 ml-1 block mb-1 flex items-center gap-1 leading-none uppercase tracking-widest"><Tag size={8} /> Category</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-black text-[10px] uppercase outline-none focus:bg-white focus:border-blue-200 border border-transparent transition-all">
                                {settings.TOUR_TYPES
                                    .filter(type => type !== "All") 
                                    .map(type => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))
                                }
                            </select></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Fee */}
                            <div><label className="text-[9px] font-black uppercase text-gray-400 ml-1 block mb-1 leading-none uppercase tracking-widest">Entry Fee (0=Free)</label>
                            <input required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-black text-xs outline-none focus:bg-white focus:border-blue-200 border border-transparent transition-all" placeholder="150" /></div>
                            
                            {/* Rating */}
                            <div><label className="text-[9px] font-black uppercase text-gray-400 ml-1 block mb-1 flex items-center gap-1 leading-none uppercase tracking-widest"><Star size={8} /> Safety Score</label>
                            <input required value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-black text-xs outline-none focus:bg-white focus:border-blue-200 border border-transparent transition-all" placeholder="4.9" /></div>
                        </div>

                        {/* Description */}
                        <div><label className="text-[9px] font-black uppercase text-gray-400 ml-1 block mb-1 uppercase tracking-widest leading-none">Encyclopedia Description</label>
                        <textarea required value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-xs outline-none h-28 resize-none focus:bg-white focus:border-blue-200 border border-transparent transition-all" placeholder="Detail insights..." /></div>

                        {/* Image URLs */}
                        <div><label className="text-[9px] font-black uppercase text-gray-400 ml-1 block mb-1 flex items-center gap-1 leading-none uppercase tracking-widest"><Camera size={10} /> Photo Gallery links (Vertical List)</label>
                            <textarea required value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-mono text-[9px] outline-none h-32 resize-none border-dashed border border-gray-200 focus:bg-white transition-all" placeholder="Paste links here (one per line)..." /></div>
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white p-5 rounded-[26px] font-black text-xs uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all border-b-4 border-slate-700">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : isEditMode ? "Apply Cloud Overwrite" : "Initialize Injection"}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default AddTour;












// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom'; // 👈 added useLocation
// import { motion } from 'framer-motion';
// import { ArrowLeft, Save, Loader2, Info, Lock, Trash2, Edit2, Camera } from 'lucide-react';
// import { ADMIN_EMAILS, TOUR_TYPES } from '../config';


// const AddTour = () => {
//     const navigate = useNavigate();
//     const location = useLocation(); // Navigation state pakadne ke liye

//     const [loading, setLoading] = useState(false);
//     const [isAdmin, setIsAdmin] = useState(false);
//     const [currentUser, setCurrentUser] = useState(null);
//     const [isEditMode, setIsEditMode] = useState(false);
//     const SHEET_API_URL = import.meta.env.VITE_SHEET_API_URL;

//     const [formData, setFormData] = useState({
//         id: Date.now(),
//         name: '',
//         loc: '',
//         price: '',
//         rating: '4.5',
//         type: 'Waterfall',
//         desc: '',
//         images: ''
//     });

//     useEffect(() => {
//         const savedUser = JSON.parse(localStorage.getItem('user'));

//         // Security check
//         const checkAccess = () => {
//             if (ADMIN_EMAILS === "*") return true;
//             if (!savedUser) return false;
//             const allowed = ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
//             return allowed.includes(savedUser.email.toLowerCase());
//         };

//         if (checkAccess()) {
//             setIsAdmin(true);
//             setCurrentUser(savedUser);

//             // ✨ ✨ AUTO-FILL DATA LOGIC (EDIT MODE) ✨ ✨
//             if (location.state && location.state.editData) {
//                 const d = location.state.editData;
//                 setIsEditMode(true);
//                 setFormData({
//                     id: d.id,
//                     name: d.name,
//                     loc: d.loc,
//                     price: d.price,
//                     rating: d.rating,
//                     type: d.type,
//                     desc: d.desc,
//                     // images array ko wapas text banane ke liye
//                     images: Array.isArray(d.images) ? d.images.join('\n') : d.images
//                 });
//             }
//         } else {
//             alert("Unauthorized Access!");
//             navigate('/');
//         }
//     }, [navigate, location]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         const payload = {
//             ...formData,
//             action: "save",
//             adminUserEmail: currentUser?.email || "Cloud"
//         };

//         try {
//             await fetch(SHEET_API_URL, { method: 'POST', body: JSON.stringify(payload) });
//             alert(isEditMode ? "Successfully Updated!" : "Destination Added!");
//             navigate('/');
//         } catch (error) {
//             // CORS Error detection handling
//             navigate('/');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!isAdmin) return <div className="h-screen bg-white flex items-center justify-center font-black text-gray-200">Checking Cloud Status...</div>;

//     return (
//         <div className="min-h-screen bg-[#F8F9FB] pb-10 font-sans text-slate-900">
//             <header className="px-6 py-4 bg-white sticky top-0 z-50 flex items-center justify-between border-b border-gray-100">
//                 <div className="flex items-center gap-4">
//                     <button onClick={() => navigate(-1)} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-75 transition-all"><ArrowLeft size={20} /></button>
//                     <h1 className="text-xl font-black">{isEditMode ? "Modify Content" : "Create New Spot"}</h1>
//                 </div>
//                 {isEditMode && <div className="bg-blue-600 text-white text-[9px] px-2 py-1 rounded-full font-black uppercase flex items-center gap-1"><Edit2 size={8} /> Edit Mode</div>}
//             </header>

//             <main className="px-6 mt-6 max-w-xl mx-auto">
//                 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-2xl mb-6 border border-gray-100 flex gap-4 items-center">
//                     <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner"><Info size={20} /></div>
//                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-tight">
//                         {isEditMode ? "Updating record by matching primary ID name in Cloud sheets." : "Ensure all details are accurate before cloud synchronization."}
//                     </p>
//                 </motion.div>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
//                         <div>
//                             <label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Destination Title</label>
//                             <input required value={formData.name} readOnly={isEditMode} onChange={e => setFormData({ ...formData, name: e.target.value })} className={`w-full ${isEditMode ? 'bg-slate-100' : 'bg-gray-50'} p-4 rounded-2xl font-bold text-sm outline-none transition-all`} placeholder="e.g. Zenith Waterfall" />
//                             {isEditMode && <span className="text-[8px] text-gray-300 font-bold uppercase mt-1 inline-block">* Field locked for consistency</span>}
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">City/Locality</label><input required value={formData.loc} onChange={e => setFormData({ ...formData, loc: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" /></div>
//                             <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Type</label><select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none">
//                                 {TOUR_TYPES
//                                     .filter(type => type !== "All") // 👈 Ye line 'All' ko nikal degi
//                                     .map(type => (
//                                         <option key={type} value={type}>
//                                             {type}
//                                         </option>
//                                     ))}
//                             </select></div>
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Entrance Fee</label><input value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" placeholder="150" /></div>
//                             <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Safety Rating</label><input value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" /></div>
//                         </div>

//                         <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Overview Description</label><textarea value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none h-24 resize-none" /></div>

//                         <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block flex items-center gap-1"><Camera size={10} /> Cloud Photos (One per line)</label>
//                             <textarea required value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-mono text-[9px] outline-none h-32 resize-none" placeholder="Paste links here..." /></div>
//                     </div>

//                     <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white p-5 rounded-[26px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
//                         {loading ? <Loader2 className="animate-spin" size={18} /> : isEditMode ? "Update Place" : "Add New Place"}
//                     </button>
//                 </form>
//             </main>
//         </div>
//     );
// };

// export default AddTour;

