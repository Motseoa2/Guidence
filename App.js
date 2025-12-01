import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Admin from './components/Admin/Admin';
import Institute from './components/Institute/Institute';
import Company from './components/Company/Company';
import Students from './components/student/Students';

import './App.css';

const App = () => {
  const appStyle = {
    minHeight: '100vh',
    backgroundImage: 'url(/a.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  };

  return (
    <Router>
      <div style={appStyle}>
        {/* Navigation bar removed from here */}
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/institute/*" element={<Institute />} />
          <Route path="/company/*" element={<Company />} />
          <Route path="/students/*" element={<Students />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;