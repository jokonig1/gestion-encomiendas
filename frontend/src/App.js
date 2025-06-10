import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import DashboardLayout from './components/layout/DashboardLayout';

// Importar vistas del conserje
import InicioConserje from './views/dashboardConserje/Inicio';
import PaquetesPendientes from './views/dashboardConserje/PaquetesPendientes';
import RegistrarPaquete from './views/dashboardConserje/RegistrarPaquete';
import HistorialEncomiendas from './views/dashboardConserje/HistorialEncomiendas';
import ReclamosConserje from './views/dashboardConserje/Reclamos';
// import VerificarRetiro from './views/dashboardConserje/VerificarRetiro'; // Eliminar o comentar la importación

// Importar vistas del residente
import InicioResidente from './views/dashboardResidente/Inicio';
import PaquetesActivos from './views/dashboardResidente/PaquetesActivos';
import HistorialResidente from './views/dashboardResidente/Historial';
import PerfilResidente from './views/dashboardResidente/Perfil';
import ReclamosResidente from './views/dashboardResidente/Reclamos';

const PrivateRoute = ({ children, userRole }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    console.log('PrivateRoute - Token:', token);
    console.log('PrivateRoute - User:', user);
    console.log('PrivateRoute - Expected Role:', userRole);

    if (!token || !user) {
        console.log('No token or user found, redirecting to login');
        return <Navigate to="/login" />;
    }

    if (userRole && user.role !== userRole) {
        console.log('Invalid role, redirecting to appropriate dashboard');
        return <Navigate to={`/dashboard/${user.role}`} />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <ToastContainer />
            
            <Routes>
                {/* Rutas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Rutas del conserje */}
                <Route
                    path="/dashboard/conserje"
                    element={
                        <PrivateRoute userRole="conserje">
                            <DashboardLayout userRole="conserje" userName="Conserje">
                                <InicioConserje />
                            </DashboardLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/conserje/pendientes"
                    element={
                        <PrivateRoute userRole="conserje">
                            <DashboardLayout userRole="conserje" userName="Conserje">
                                <PaquetesPendientes />
                            </DashboardLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/conserje/registrar"
                    element={
                        <PrivateRoute userRole="conserje">
                            <DashboardLayout userRole="conserje" userName="Conserje">
                                <RegistrarPaquete />
                            </DashboardLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/conserje/historial"
                    element={
                        <PrivateRoute userRole="conserje">
                            <DashboardLayout userRole="conserje" userName="Conserje">
                                <HistorialEncomiendas />
                            </DashboardLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/conserje/reclamos"
                    element={
                        <PrivateRoute userRole="conserje">
                            <DashboardLayout userRole="conserje" userName="Conserje">
                                <ReclamosConserje />
                            </DashboardLayout>
                        </PrivateRoute>
                    }
                />

                {/* Rutas del residente */}
                <Route
                    path="/dashboard/residente"
                    element={
                        <PrivateRoute userRole="residente">
                            <DashboardLayout userRole="residente" userName="Residente">
                                <InicioResidente />
                            </DashboardLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/residente/activos"
                    element={
                        <PrivateRoute userRole="residente">
                            <DashboardLayout userRole="residente" userName="Residente">
                                <PaquetesActivos />
                            </DashboardLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/residente/historial"
                    element={
                        <PrivateRoute userRole="residente">
                            <DashboardLayout userRole="residente" userName="Residente">
                                <HistorialResidente />
                            </DashboardLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/residente/perfil"
                    element={
                        <PrivateRoute userRole="residente">
                            <DashboardLayout userRole="residente" userName="Residente">
                                <PerfilResidente />
                            </DashboardLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/residente/reclamos"
                    element={
                        <PrivateRoute userRole="residente">
                            <DashboardLayout userRole="residente" userName="Residente">
                                <ReclamosResidente />
                            </DashboardLayout>
                        </PrivateRoute>
                    }
                />

                {/* Redirección por defecto */}
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App; 