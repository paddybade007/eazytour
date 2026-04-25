import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Details from './pages/Details'; // Agar Details.jsx bana li hai toh
import Login from './pages/Login'; // ✅ Ye line missing hogi, ise add karo
import AddTour from './pages/AddTour'
// import ConfigManager from './pages/ConfigManager';


function App() {
  return (
    <Router>
      <div className="font-sans">
        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} /> 

          <Route path="/details/:id" element={<Details />} />
          
          <Route path="*" element={<Home />} />

          <Route path="/admin/add" element={<AddTour />} />

          {/* <Route path="/admin/configs" element={<ConfigManager />} /> */}

        </Routes>
      </div>
    </Router>
  );
}

export default App;