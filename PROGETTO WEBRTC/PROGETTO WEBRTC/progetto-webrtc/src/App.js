import logo from './logo.svg';
import './App.css';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from './DashBoard.js';
import  WebRTCApp from './DashboardCall.js'
import InfoPage from './InfoPage.js';
import Login from './Login.js';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <Router>
    <Routes>
      <Route
        path="/login"
        element={<Login onLogin={setIsAuthenticated} />}
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
        }
      />
      <Route 
          path="/call"
          element={
            <InfoPage></InfoPage>
          }
      />

      <Route 
          path='/chat'
          element = {
            <WebRTCApp></WebRTCApp>
          }
      />

        
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />
    </Routes>
    <Toaster position='bottom-left'/>
  </Router>
  );
}

export default App;