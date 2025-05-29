import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const RegistrarPaquete = () => {
    const [formData, setFormData] = useState({
        numeroTracking: '',
        destinatario: '',
        departamento: '',
        descripcion: '',
        estado: 'pendiente'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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
            const response = await fetch(`${API_URL}/api/paquetes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Error al registrar el paquete');
            }

            setSuccess(true);
            setFormData({
                numeroTracking: '',
                destinatario: '',
                departamento: '',
                descripcion: '',
                estado: 'pendiente'
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout userRole="conserje">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nuevo Paquete</h2>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
                        Paquete registrado exitosamente
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="numeroTracking" className="block text-sm font-medium text-gray-700">
                            Número de Tracking
                        </label>
                        <input
                            type="text"
                            id="numeroTracking"
                            name="numeroTracking"
                            value={formData.numeroTracking}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="destinatario" className="block text-sm font-medium text-gray-700">
                            Destinatario
                        </label>
                        <input
                            type="text"
                            id="destinatario"
                            name="destinatario"
                            value={formData.destinatario}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">
                            Departamento
                        </label>
                        <input
                            type="text"
                            id="departamento"
                            name="departamento"
                            value={formData.departamento}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                            Descripción
                        </label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                            Estado
                        </label>
                        <select
                            id="estado"
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="entregado">Entregado</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Registrando...' : 'Registrar Paquete'}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default RegistrarPaquete; 