import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck, Globe } from 'lucide-react';

// ✅ Config se URLs uthao
import { GOOGLE_USER_INFO_URL } from '../config'; 

const Login = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (token) => {
      // ✅ Ab ye dynamic hai, config se aa raha hai
      try {
        const res = await fetch(GOOGLE_USER_INFO_URL, { 
          headers: { Authorization: `Bearer ${token.access_token}` } 
        });
        const data = await res.json();
        
        localStorage.setItem('user', JSON.stringify(data));
        
        // Success check (Optionally success message yahan add kar sakte ho)
        navigate('/');
      } catch (err) {
        console.error("User Info Fetch Error:", err);
        alert("Login successful, but profile fetch failed.");
      }
    },
    onError: () => console.log('Login Failed'),
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 min-h-[450px]"
      >
        
        {/* LEFT BRAND SECTION */}
        <div className="w-full md:w-1/2 bg-blue-600 p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <Globe className="absolute -top-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
          <div className="z-10">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
              <LogIn size={24} />
            </div>
            <h1 className="text-4xl font-black leading-tight">Start Your<br />Adventure.</h1>
            <p className="text-blue-100 mt-4 text-sm font-medium tracking-tight">Join thousands exploring Mumbai's hidden gems.</p>
          </div>
          
          <div className="z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
            <ShieldCheck size={14} />
            <span>Identity Secured by Google</span>
          </div>
        </div>

        {/* RIGHT LOGIN SECTION */}
        <div className="w-full md:w-1/2 p-10 lg:p-14 flex flex-col justify-center bg-white text-center md:text-left">
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3 block">AUTHENTICATION</span>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Welcome to Safar</h2>
          <p className="text-gray-400 text-sm mt-2 mb-10 font-medium px-4 md:px-0">Sign in with your Google account to unlock full experiences and bookings.</p>
          
          <button 
            onClick={() => login()} 
            className="w-full h-16 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-4 hover:bg-gray-50 hover:border-blue-200 transition-all active:scale-95 shadow-sm group"
          >
            {/* GOOGLE LOGO SVG */}
            <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.86-2.59 3.3-4.53 12-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-slate-700 font-black text-sm uppercase tracking-tight">Sign in with Google</span>
          </button>
          
          <p className="mt-8 text-[10px] text-gray-300 font-black uppercase tracking-widest leading-relaxed">
            By signing in, you confirm our <br className="hidden md:block"/> 
            <span className="text-blue-400 cursor-pointer">Terms</span> & <span className="text-blue-400 cursor-pointer">Privacy</span> agreement.
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
