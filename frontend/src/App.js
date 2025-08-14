import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Dashboard from './components/Dashboard/Dashboard';
import LoginPage from './components/LoginPage';
import QuizInterface from './components/Quiz/QuizInterface';

function App() {
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/quiz" element={isAuthenticated ? <QuizInterface /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
