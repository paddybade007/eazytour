import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Info, Lock, Trash2, Edit2, Camera, ShieldCheck } from 'lucide-react';
import { ADMIN_EMAILS, TOUR_TYPES } from '../config';
import CloudSuccessToast from '../components/CloudSuccessToast';

const AddTour = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const SHEET_API_URL = import.meta.env.VITE_SHEET_API_URL;
    const [toastMsg, setToastMsg] = useState("");

    const [formData, setFormData] = useState({
        id: Date.now(),
        name: '',
        loc: '',
        price: '',
        rating: '4.5',
        type: 'Waterfall',
        desc: '',
        images: ''
    });

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));

        const checkAccess = () => {
            if (ADMIN_EMAILS === "*") return true;
            if (!savedUser) return false;
            const allowed = ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
            return allowed.includes(savedUser.email.toLowerCase());
        };

        if (checkAccess()) {
            setIsAdmin(true);
            setCurrentUser(savedUser);

            if (location.state && location.state.editData) {
                const d = location.state.editData;
                setIsEditMode(true);
                setFormData({
                    id: d.id,
                    name: d.name,
                    loc: d.loc,
                    price: d.price,
                    rating: d.rating,
                    type: d.type,
                    desc: d.desc,
                    images: Array.isArray(d.images) ? d.images.join('\n') : d.images
                });
            }
        } else {
            // ✅ Alert removed and replaced with Toast + Delayed Navigate
            setToastMsg("Unauthorized Access - Redirection Active");
            setTimeout(() => navigate('/'), 2500);
        }
    }, [navigate, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            action: "save",
            adminUserEmail: currentUser?.email || "Cloud"
        };

        try {
            await fetch(SHEET_API_URL, { method: 'POST', body: JSON.stringify(payload) });
            const msg = isEditMode 
                ? `${formData.name} - Updated Successfully` 
                : `${formData.name} - New Place Added Successfully`;
            setToastMsg(msg);
            setTimeout(() => navigate('/'), 2500);
        } catch (error) {
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    // Render logic with toast support for unauthorized attempts
    if (!isAdmin) return (
        <div className="h-screen bg-white flex items-center justify-center font-black text-gray-200 uppercase">
            Checking Cloud Status...
            <CloudSuccessToast message={toastMsg} isOpen={!!toastMsg} onClose={() => setToastMsg("")} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FB] pb-10 font-sans text-slate-900">
            
            <header className="px-6 py-4 bg-white sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-75 transition-all"><ArrowLeft size={20} /></button>
                    <div className="leading-tight">
                        <h1 className="text-s font-black uppercase">{isEditMode ? "Modify Place" : "Add New Place"}</h1>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter italic">Secured Cloud Link</p>
                    </div>
                </div>
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner">
                    <ShieldCheck size={22} />
                </div>
            </header>

            <main className="px-6 mt-6 max-w-xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-2xl mb-6 border border-gray-100 flex gap-4 items-center">
                    <div className="relative group h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner cursor-help">
                        <Info size={20} />
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-[110] bg-slate-900 text-white text-[8px] font-black px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap uppercase tracking-widest border border-white/10 pointer-events-none">
                            You have to request admin to add/update the data
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                        </div>
                    </div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-tight">
                        {isEditMode ? "You are now modifying live cloud records." : "Ensure all details are accurate before cloud synchronization."}
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
                        
                        <div>
                            <label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Destination Title</label>
                            <input 
                                required 
                                value={formData.name} 
                                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none transition-all focus:bg-white focus:ring-1 ring-blue-100" 
                                placeholder="e.g. Zenith Waterfall" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">City/Locality</label><input required value={formData.loc} onChange={e => setFormData({ ...formData, loc: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" /></div>
                            <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Type</label><select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none">
                                {TOUR_TYPES
                                    .filter(type => type !== "All")
                                    .map(type => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                            </select></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Entrance Fee</label><input value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" placeholder="150" /></div>
                            <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Safety Rating</label><input value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" /></div>
                        </div>

                        <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Overview Description</label><textarea value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none h-24 resize-none" /></div>

                        <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block flex items-center gap-1"><Camera size={10} /> Cloud Photos (One per line)</label>
                            <textarea required value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-mono text-[9px] outline-none h-32 resize-none" placeholder="Paste links here..." /></div>
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white p-5 rounded-[26px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : isEditMode ? "Update Place" : "Add New Place"}
                    </button>
                </form>
            </main>
            <CloudSuccessToast message={toastMsg} isOpen={!!toastMsg} onClose={() => setToastMsg("")} />
        </div>
    );
};

export default AddTour;







// ##################### WORKING ON THIS FILE - 1.1.5 #####################

// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { ArrowLeft, Save, Loader2, Info, Lock, Trash2, Edit2, Camera, ShieldCheck } from 'lucide-react';
// import { ADMIN_EMAILS, TOUR_TYPES } from '../config';
// import CloudSuccessToast from '../components/CloudSuccessToast';


// const AddTour = () => {
//     const navigate = useNavigate();
//     const location = useLocation();

//     const [loading, setLoading] = useState(false);
//     const [isAdmin, setIsAdmin] = useState(false);
//     const [currentUser, setCurrentUser] = useState(null);
//     const [isEditMode, setIsEditMode] = useState(false);
//     const SHEET_API_URL = import.meta.env.VITE_SHEET_API_URL;
//     const [toastMsg, setToastMsg] = useState("");


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

//         const checkAccess = () => {
//             if (ADMIN_EMAILS === "*") return true;
//             if (!savedUser) return false;
//             const allowed = ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
//             return allowed.includes(savedUser.email.toLowerCase());
//         };

//         if (checkAccess()) {
//             setIsAdmin(true);
//             setCurrentUser(savedUser);

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
//             const msg = isEditMode 
//            ? `${formData.name} - Updated Successfully` 
//            : `${formData.name} - New Place Added Successfully`;
//            setToastMsg(msg);
//            setTimeout(() => navigate('/'), 2500);
//         } catch (error) {
//             navigate('/');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!isAdmin) return <div className="h-screen bg-white flex items-center justify-center font-black text-gray-200 uppercase">Checking Cloud Status...</div>;

//     return (
//         <div className="min-h-screen bg-[#F8F9FB] pb-10 font-sans text-slate-900">
            
//             <header className="px-6 py-4 bg-white sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 shadow-sm">
//                 <div className="flex items-center gap-4">
//                     <button onClick={() => navigate(-1)} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-75 transition-all"><ArrowLeft size={20} /></button>
//                     <div className="leading-tight">
//                         <h1 className="text-s font-black uppercase">{isEditMode ? "Modify Place" : "Add New Place"}</h1>
//                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter italic">Secured Cloud Link</p>
//                     </div>
//                 </div>
//                 <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner">
//                     <ShieldCheck size={22} />
//                 </div>
//             </header>



//             <main className="px-6 mt-6 max-w-xl mx-auto">
//                 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-2xl mb-6 border border-gray-100 flex gap-4 items-center">
//                     <div className="relative group h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner cursor-help">
//                         <Info size={20} />
//                         <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-[110] bg-slate-900 text-white text-[8px] font-black px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap uppercase tracking-widest border border-white/10 pointer-events-none">
//                             You have to request admin to add/update the data
//                             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
//                         </div>
//                     </div>
//                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-tight">
//                         {isEditMode ? "You are now modifying live cloud records." : "Ensure all details are accurate before cloud synchronization."}
//                     </p>
//                 </motion.div>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
                        
//                         {/* ✅ TITLE FIELD UNLOCKED (Ab ye Edit mode me change ho sakta hai) */}
//                         <div>
//                             <label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Destination Title</label>
//                             <input 
//                                 required 
//                                 value={formData.name} 
//                                 onChange={e => setFormData({ ...formData, name: e.target.value })} 
//                                 className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none transition-all focus:bg-white focus:ring-1 ring-blue-100" 
//                                 placeholder="e.g. Zenith Waterfall" 
//                             />
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">City/Locality</label><input required value={formData.loc} onChange={e => setFormData({ ...formData, loc: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" /></div>
//                             <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Type</label><select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none">
//                                 {TOUR_TYPES
//                                     .filter(type => type !== "All")
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
//             <CloudSuccessToast message={toastMsg} isOpen={!!toastMsg} onClose={() => setToastMsg("")} />
//         </div>
//     );
// };

// export default AddTour;