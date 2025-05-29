import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const MisPaquetes = () => {
    const [paquetes, setPaquetes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState('todos');

    useEffect(() => {
        fetchPaquetes();
    }, [filtro]);

    const fetchPaquetes = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = filtro === 'todos' 
                ? `${API_URL}/api/paquetes/residente`
                : `${API_URL}/api/paquetes/residente?estado=${filtro}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar los paquetes');
            }

            const data = await response.json();
            setPaquetes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReportarProblema = (paqueteId) => {
        window.location.href = `/dashboard/residente/reclamos/nuevo?paqueteId=${paqueteId}`;
    };

    if (loading) {
        return (
            <DashboardLayout userRole="residente">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userRole="residente">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Mis Paquetes</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                            Total: {paquetes.length} paquetes
                        </span>
                        <select
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="todos">Todos</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="entregado">Entregados</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {paquetes.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                        <p className="text-gray-500">No tienes paquetes registrados</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tracking
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Descripción
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha de Recepción
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha de Entrega
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paquetes.map((paquete) => (
                                        <tr key={paquete._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {paquete.numeroTracking}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {paquete.descripcion}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    paquete.estado === 'entregado'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {paquete.estado === 'entregado' ? 'Entregado' : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(paquete.fechaRecepcion).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {paquete.fechaEntrega
                                                    ? new Date(paquete.fechaEntrega).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {paquete.estado === 'pendiente' && (
                                                    <button
                                                        onClick={() => handleReportarProblema(paquete._id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Reportar Problema
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MisPaquetes; 