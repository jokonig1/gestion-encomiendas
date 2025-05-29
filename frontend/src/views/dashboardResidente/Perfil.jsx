import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const Perfil = () => {
    const [perfil, setPerfil] = useState({
        nombre: '',
        email: '',
        departamento: '',
        telefono: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [editando, setEditando] = useState(false);

    useEffect(() => {
        fetchPerfil();
    }, []);

    const fetchPerfil = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/usuarios/perfil`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar el perfil');
            }

            const data = await response.json();
            setPerfil(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPerfil(prev => ({
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
            const response = await fetch(`${API_URL}/api/usuarios/perfil`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(perfil)
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el perfil');
            }

            setSuccess(true);
            setEditando(false);
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

    return (
        <DashboardLayout userRole="residente">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
                    {!editando && (
                        <button
                            onClick={() => setEditando(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Editar Perfil
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
                        Perfil actualizado exitosamente
                    </div>
                )}

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    {editando ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={perfil.nombre}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={perfil.email}
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
                                    value={perfil.departamento}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    name="telefono"
                                    value={perfil.telefono}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setEditando(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Nombre Completo</h3>
                                <p className="mt-1 text-gray-900">{perfil.nombre}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Correo Electrónico</h3>
                                <p className="mt-1 text-gray-900">{perfil.email}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Departamento</h3>
                                <p className="mt-1 text-gray-900">{perfil.departamento}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                                <p className="mt-1 text-gray-900">{perfil.telefono || 'No especificado'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Perfil; 