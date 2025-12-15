import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import ExercisePreview from './pages/ExercisePreview';
import Nutrition from './pages/Nutrition';
import Community from './pages/Community';
import Squat from './exercises/Squat';
import ArmCircle from './exercises/ArmCircle';
import BicepCurl from './exercises/BicepCurl';
import Lunge from './exercises/Lunge';
import Pushup from './exercises/Pushup';
import CatCow from './exercises/CatCow';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/exercises/:id" element={<ExercisePreview />} />

            {/* Active Workouts */}
            <Route path="/exercises/squat/start" element={<Squat />} />
            <Route path="/exercises/arm-circle/start" element={<ArmCircle />} />
            <Route path="/exercises/bicep-curl/start" element={<BicepCurl />} />
            <Route path="/exercises/lunge/start" element={<Lunge />} />
            <Route path="/exercises/pushup/start" element={<Pushup />} />
            <Route path="/exercises/cat-cow/start" element={<CatCow />} />

            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
