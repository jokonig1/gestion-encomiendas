import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const ReportarProblema = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paquete, setPaquete] = useState(null);
    const [formData, setFormData] = useState({
        tipo: 'daño',
        descripcion: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const paqueteId = new URLSearchParams(location.search).get('paqueteId');
        if (paqueteId) {
            fetchPaquete(paqueteId);
        } else {
            setLoading(false);
        }
    }, [location]);

    const fetchPaquete = async (paqueteId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/paquetes/${paqueteId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar la información del paquete');
            }

            const data = await response.json();
            setPaquete(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/reclamos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    paqueteId: paquete._id
                })
            });

            if (!response.ok) {
                throw new Error('Error al enviar el reclamo');
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard/residente/paquetes');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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

    if (!paquete) {
        return (
            <DashboardLayout userRole="residente">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    No se encontró información del paquete
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userRole="residente">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Reportar Problema</h2>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Información del Paquete</h3>
                    <div className="space-y-2">
                        <p className="text-gray-600">
                            <span className="font-medium">Número de Tracking:</span> {paquete.numeroTracking}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Descripción:</span> {paquete.descripcion}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Fecha de Recepción:</span>{' '}
                            {new Date(paquete.fechaRecepcion).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
                        Reclamo enviado exitosamente. Redirigiendo...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                                Tipo de Problema
                            </label>
                            <select
                                id="tipo"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="daño">Daño en el Paquete</option>
                                <option value="perdida">Pérdida del Paquete</option>
                                <option value="retraso">Retraso en la Entrega</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                                Descripción del Problema
                            </label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows="4"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Por favor, describe detalladamente el problema..."
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/residente/paquetes')}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                            >
                                {loading ? 'Enviando...' : 'Enviar Reclamo'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default ReportarProblema; 