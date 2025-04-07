import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import Register from './components/Register';

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

// Componentes placeholder para los dashboards
const ConserjeDashboard = () => (
    <div className="p-4">
        <h1 className="text-2xl font-bold">Dashboard Conserje</h1>
    </div>
);

const ResidenteDashboard = () => (
    <div className="p-4">
        <h1 className="text-2xl font-bold">Dashboard Residente</h1>
    </div>
);

function App() {
    return (
        <Router>
            <div className="App">
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/dashboard/conserje"
                        element={
                            <PrivateRoute>
                                <ConserjeDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/dashboard/residente"
                        element={
                            <PrivateRoute>
                                <ResidenteDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App; 