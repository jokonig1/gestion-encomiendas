import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        pendientes: 0,
        entregados: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/paquetes/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Error al cargar las estadísticas');
                }

                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <DashboardLayout userRole="conserje">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout userRole="conserje">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userRole="conserje">
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard del Conserje</h2>
                
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700">Total de Paquetes</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700">Pendientes</h3>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pendientes}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700">Entregados</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.entregados}</p>
                    </div>
                </div>

                {/* Acciones rápidas */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Acciones Rápidas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => window.location.href = '/dashboard/conserje/nueva-encomienda'}
                            className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <span className="mr-2">📦</span>
                            Registrar Nuevo Paquete
                        </button>
                        <button
                            onClick={() => window.location.href = '/dashboard/conserje/encomiendas-pendientes'}
                            className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <span className="mr-2">📋</span>
                            Ver Paquetes Pendientes
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard; 