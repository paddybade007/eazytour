// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, Save, Loader2, RefreshCcw, Key, FileJson, CheckCircle } from 'lucide-react';
// import { SHEET_API_URL } from '../config';

// const ConfigManager = () => {
//   const navigate = useNavigate();
//   const [configs, setConfigs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [status, setStatus] = useState("");

//   useEffect(() => {
//     fetchConfigs();
//   }, []);

//   const fetchConfigs = async () => {
//     setLoading(true);
//     const res = await fetch(`${SHEET_API_URL}?mode=configs`);
//     const data = await res.json();
//     setConfigs(data);
//     setLoading(false);
//   };

//   const handleLiveUpdate = async (key, value) => {
//     setStatus(`Saving ${key}...`);
//     try {
//       await fetch(SHEET_API_URL, {
//         method: 'POST',
//         body: JSON.stringify({ action: "update_config", key, value })
//       });
//       setStatus("All changes synced to Cloud! ✅");
//       setTimeout(() => setStatus(""), 2000);
//     } catch (e) { setStatus("Sync Error ❌"); }
//   };

//   if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-blue-600">LOADING REMOTE CONFIG...</div>;

//   return (
//     <div className="min-h-screen bg-[#F8F9FB] pb-20 font-sans">
//       <header className="px-6 py-4 bg-white sticky top-0 z-50 flex items-center justify-between border-b shadow-sm">
//         <div className="flex items-center gap-3">
//           <button onClick={() => navigate(-1)} className="h-9 w-9 bg-gray-50 rounded-xl flex items-center justify-center active:scale-75 transition-all"><ArrowLeft size={18}/></button>
//           <h1 className="text-lg font-black uppercase tracking-tighter italic text-slate-800">System <span className="text-blue-600 underline">Registry</span></h1>
//         </div>
//         <div className="text-[9px] font-black text-blue-500 uppercase bg-blue-50 px-3 py-1 rounded-full">{status || "Ready to update"}</div>
//       </header>

//       <main className="max-w-2xl mx-auto p-4 space-y-4">
//         {configs.map((item, i) => (
//           <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm space-y-3">
//             <div className="flex justify-between items-center px-1">
//                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Key size={10}/> {item.key}</span>
//                {item.value.includes('{') && <FileJson size={14} className="text-orange-400" />}
//             </div>

//             {item.key.includes("COLOR") || item.key.includes("TYPE") || item.key.includes("EMAILS") ? (
//               <textarea 
//                 defaultValue={item.value} 
//                 onBlur={(e) => handleLiveUpdate(item.key, e.target.value)}
//                 rows={item.key === "TOUR_TYPE_COLORS" ? 8 : 2}
//                 className="w-full bg-slate-50 border border-gray-100 p-4 rounded-2xl font-mono text-[11px] leading-relaxed outline-none focus:bg-white focus:border-blue-500 transition-all"
//               />
//             ) : (
//               <input 
//                 defaultValue={item.value} 
//                 onBlur={(e) => handleLiveUpdate(item.key, e.target.value)}
//                 className="w-full bg-slate-50 border border-gray-100 p-4 rounded-2xl font-black text-xs text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
//               />
//             )}
//           </motion.div>
//         ))}

//         <div className="p-4 bg-orange-50 border border-orange-100 rounded-[24px]">
//            <p className="text-[9px] text-orange-700 font-bold uppercase leading-relaxed italic text-center">
//              * Note: Any changes here will reflect instantly on all devices after they refresh their sessions. 🔐 Safar Global Cloud System.
//            </p>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default ConfigManager;





// // import React, { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { ArrowLeft, Save, Loader2, RefreshCcw, ShieldCheck, Key, Settings } from 'lucide-react';
// // import { SHEET_API_URL, ADMIN_EMAILS } from '../config';

// // const ConfigManager = () => {
// //   const navigate = useNavigate();
// //   const [configs, setConfigs] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [saving, setSaving] = useState(null); // specific key saving tracking

// //   // 🔐 ADMIN ONLY Check (Security)
// //   useEffect(() => {
// //     const savedUser = JSON.parse(localStorage.getItem('user'));
// //     const allowed = ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
// //     if (!savedUser || (ADMIN_EMAILS !== "*" && !allowed.includes(savedUser.email.toLowerCase()))) {
// //       alert("Admin Access Denied!"); navigate('/'); return;
// //     }
// //     fetchConfigs();
// //   }, []);

// //   const fetchConfigs = async () => {
// //     setLoading(true);
// //     const res = await fetch(`${SHEET_API_URL}?mode=configs`);
// //     const data = await res.json();
// //     setConfigs(data);
// //     setLoading(false);
// //   };

// //   const handleUpdate = async (key, value) => {
// //     setSaving(key);
// //     try {
// //       await fetch(SHEET_API_URL, {
// //         method: 'POST',
// //         body: JSON.stringify({ action: "update_config", key, value })
// //       });
// //       alert(`${key} updated successfully!`);
// //     } catch (e) {
// //       console.error(e);
// //     } finally {
// //       setSaving(null);
// //     }
// //   };

// //   if (loading) return <div className="h-screen flex items-center justify-center bg-white animate-pulse font-black text-gray-400 uppercase">Fetching Remote Control...</div>;

// //   return (
// //     <div className="min-h-screen bg-[#F9FAFB] pb-10 font-sans text-slate-900">
// //       <header className="px-6 py-4 bg-white sticky top-0 z-50 flex items-center gap-4 border-b">
// //         <button onClick={() => navigate(-1)} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center active:scale-90"><ArrowLeft size={20}/></button>
// //         <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">Global <span className="text-blue-600">Configs</span> <Settings size={18}/></h1>
// //       </header>

// //       <main className="max-w-xl mx-auto p-6 space-y-6">
// //         <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
// //           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b pb-4">Variable CRUD Operations</p>
          
// //           <div className="space-y-6">
// //             {configs.map((item, i) => (
// //               <div key={i} className="flex flex-col gap-2 p-2 rounded-2xl hover:bg-gray-50 transition-all">
// //                 <div className="flex justify-between items-center px-1">
// //                   <span className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-2">
// //                     <Key size={12}/> {item.key}
// //                   </span>
// //                   {saving === item.key ? (
// //                     <Loader2 size={12} className="animate-spin text-blue-600" />
// //                   ) : (
// //                     <span className="text-[9px] text-green-500 font-bold uppercase tracking-tighter">Synced</span>
// //                   )}
// //                 </div>
                
// //                 <div className="relative group">
// //                   <input 
// //                     defaultValue={item.value} 
// //                     onBlur={(e) => handleUpdate(item.key, e.target.value)}
// //                     className="w-full bg-white border border-gray-200 p-4 rounded-xl font-black text-sm text-slate-700 outline-none focus:border-blue-600 focus:shadow-md transition-all shadow-sm"
// //                   />
// //                   <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
// //                     <Save size={16} className="text-gray-300" />
// //                   </div>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>

// //         <button 
// //           onClick={fetchConfigs}
// //           className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white p-5 rounded-3xl font-black text-xs uppercase tracking-widest active:scale-95 shadow-lg shadow-slate-100"
// //         >
// //           <RefreshCcw size={16}/> Refresh Configuration
// //         </button>
// //       </main>
// //     </div>
// //   );
// // };

// // export default ConfigManager;