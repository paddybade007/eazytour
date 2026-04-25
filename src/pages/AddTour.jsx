import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 👈 added useLocation
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Info, Lock, Trash2, Edit2, Camera } from 'lucide-react';
import { ADMIN_EMAILS, TOUR_TYPES } from '../config';


const AddTour = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Navigation state pakadne ke liye

    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const SHEET_API_URL = import.meta.env.VITE_SHEET_API_URL;

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

        // Security check
        const checkAccess = () => {
            if (ADMIN_EMAILS === "*") return true;
            if (!savedUser) return false;
            const allowed = ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
            return allowed.includes(savedUser.email.toLowerCase());
        };

        if (checkAccess()) {
            setIsAdmin(true);
            setCurrentUser(savedUser);

            // ✨ ✨ AUTO-FILL DATA LOGIC (EDIT MODE) ✨ ✨
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
                    // images array ko wapas text banane ke liye
                    images: Array.isArray(d.images) ? d.images.join('\n') : d.images
                });
            }
        } else {
            alert("Unauthorized Access!");
            navigate('/');
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
            alert(isEditMode ? "Successfully Updated!" : "Destination Added!");
            navigate('/');
        } catch (error) {
            // CORS Error detection handling
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) return <div className="h-screen bg-white flex items-center justify-center font-black text-gray-200">Checking Cloud Status...</div>;

    return (
        <div className="min-h-screen bg-[#F8F9FB] pb-10 font-sans text-slate-900">
            <header className="px-6 py-4 bg-white sticky top-0 z-50 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-75 transition-all"><ArrowLeft size={20} /></button>
                    <h1 className="text-xl font-black">{isEditMode ? "Modify Content" : "Create New Spot"}</h1>
                </div>
                {isEditMode && <div className="bg-blue-600 text-white text-[9px] px-2 py-1 rounded-full font-black uppercase flex items-center gap-1"><Edit2 size={8} /> Edit Mode</div>}
            </header>

            <main className="px-6 mt-6 max-w-xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-2xl mb-6 border border-gray-100 flex gap-4 items-center">
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner"><Info size={20} /></div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-tight">
                        {isEditMode ? "Updating record by matching primary ID name in Cloud sheets." : "Ensure all details are accurate before cloud synchronization."}
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
                        <div>
                            <label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Destination Title</label>
                            <input required value={formData.name} readOnly={isEditMode} onChange={e => setFormData({ ...formData, name: e.target.value })} className={`w-full ${isEditMode ? 'bg-slate-100' : 'bg-gray-50'} p-4 rounded-2xl font-bold text-sm outline-none transition-all`} placeholder="e.g. Zenith Waterfall" />
                            {isEditMode && <span className="text-[8px] text-gray-300 font-bold uppercase mt-1 inline-block">* Field locked for consistency</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">City/Locality</label><input required value={formData.loc} onChange={e => setFormData({ ...formData, loc: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" /></div>
                            <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Type</label><select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none">
                                {TOUR_TYPES
                                    .filter(type => type !== "All") // 👈 Ye line 'All' ko nikal degi
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
        </div>
    );
};

export default AddTour;

