import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Booking from './components/Booking';
import SalonDashboard from './components/SalonDashboard';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Booking />} />
        <Route path="/dashboard/:salonId" element={<SalonDashboard />} />
      </Routes>
    </div>
  );
}

export default App;