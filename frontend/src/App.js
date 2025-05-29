import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import Register from './components/Register';
import DashboardConserje from './views/dashboardConserje/Dashboard';
import DashboardResidente from './views/dashboardResidente/Dashboard';
import PaquetesPendientes from './views/dashboardConserje/PaquetesPendientes';
import Historial from './views/dashboardConserje/Historial';
import Reclamos from './views/dashboardConserje/Reclamos';
import MisPaquetes from './views/dashboardResidente/MisPaquetes';
import HistorialResidente from './views/dashboardResidente/Historial';
import Perfil from './views/dashboardResidente/Perfil';
import MisReclamos from './views/dashboardResidente/MisReclamos';
import ReportarProblema from './views/dashboardResidente/ReportarProblema';

// Componente para proteger rutas
const PrivateRoute = ({ children, userRole }) => {
    const token = localStorage.getItem('token');
    const storedUserRole = localStorage.getItem('userRole');

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (userRole && storedUserRole !== userRole) {
        return <Navigate to="/login" />;
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
                            <DashboardConserje />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/dashboard/conserje/pendientes" 
                    element={
                        <PrivateRoute userRole="conserje">
                            <PaquetesPendientes />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/dashboard/conserje/historial" 
                    element={
                        <PrivateRoute userRole="conserje">
                            <Historial />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/dashboard/conserje/reclamos" 
                    element={
                        <PrivateRoute userRole="conserje">
                            <Reclamos />
                        </PrivateRoute>
                    } 
                />

                {/* Rutas del residente */}
                <Route 
                    path="/dashboard/residente" 
                    element={
                        <PrivateRoute userRole="residente">
                            <DashboardResidente />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/dashboard/residente/paquetes" 
                    element={
                        <PrivateRoute userRole="residente">
                            <MisPaquetes />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/dashboard/residente/historial" 
                    element={
                        <PrivateRoute userRole="residente">
                            <HistorialResidente />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/dashboard/residente/perfil" 
                    element={
                        <PrivateRoute userRole="residente">
                            <Perfil />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/dashboard/residente/reclamos" 
                    element={
                        <PrivateRoute userRole="residente">
                            <MisReclamos />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/dashboard/residente/reportar-problema" 
                    element={
                        <PrivateRoute userRole="residente">
                            <ReportarProblema />
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