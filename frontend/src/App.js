import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import DashboardHome from './components/DashboardHome';
import NuevaEncomienda from './components/NuevaEncomienda';
import EncomiendasPendientes from './components/EncomiendasPendientes';
import HistorialEncomiendas from './components/HistorialEncomiendas';
import ClientDashboard from './components/dashboard/ClientDashboard';
import ActivePackages from './components/dashboard/ActivePackages';
import PackageHistory from './components/dashboard/PackageHistory';
import Profile from './components/dashboard/Profile';

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

// Componente placeholder para el dashboard de residente
const ResidenteDashboard = () => (
    <div className="p-4">
        <h1 className="text-2xl font-bold">Dashboard Residente</h1>
    </div>
);

function App() {
    return (
        <Router>
            <ToastContainer />
            
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rutas del Conserje */}
                <Route
                    path="/dashboard/conserje"
                    element={
                        <PrivateRoute>
                            <Dashboard>
                                <DashboardHome />
                            </Dashboard>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/conserje/nueva-encomienda"
                    element={
                        <PrivateRoute>
                            <Dashboard>
                                <NuevaEncomienda />
                            </Dashboard>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/conserje/encomiendas-pendientes"
                    element={
                        <PrivateRoute>
                            <Dashboard>
                                <EncomiendasPendientes />
                            </Dashboard>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/conserje/historial"
                    element={
                        <PrivateRoute>
                            <Dashboard>
                                <HistorialEncomiendas />
                            </Dashboard>
                        </PrivateRoute>
                    }
                />

                {/* Rutas del Cliente */}
                <Route
                    path="/dashboard/cliente"
                    element={
                        <PrivateRoute>
                            <ClientDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/cliente/active"
                    element={
                        <PrivateRoute>
                            <ClientDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/cliente/history"
                    element={
                        <PrivateRoute>
                            <ClientDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/cliente/profile"
                    element={
                        <PrivateRoute>
                            <ClientDashboard />
                        </PrivateRoute>
                    }
                />

                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App; 