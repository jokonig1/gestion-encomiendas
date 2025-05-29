import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL, ROLES } from '../config';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Intentando login en:', `${API_URL}/api/auth/login`);
            const response = await axios.post(`${API_URL}/api/auth/login`, formData);
            console.log('Respuesta del servidor:', response.data);
            
            const { token, user } = response.data;

            if (!token || !user) {
                throw new Error('Respuesta del servidor inválida');
            }

            // Guardar datos en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('userId', user.id);

            // Mostrar mensaje de éxito
            toast.success('¡Inicio de sesión exitoso!');

            // Redirigir según el rol del usuario
            if (user.role === ROLES.CONSERJE) {
                navigate('/dashboard/conserje');
            } else if (user.role === ROLES.RESIDENTE) {
                navigate('/dashboard/residente');
            } else {
                toast.error('Rol de usuario no válido');
                localStorage.clear();
                navigate('/login');
            }
        } catch (error) {
            console.error('Error completo:', error);
            
            if (error.response) {
                // El servidor respondió con un código de error
                console.error('Datos de error:', error.response.data);
                console.error('Estado de error:', error.response.status);
                toast.error(error.response.data.message || 'Error en el servidor');
            } else if (error.request) {
                // La petición fue hecha pero no se recibió respuesta
                console.error('No se recibió respuesta del servidor');
                toast.error('No se pudo conectar con el servidor. Verifique su conexión.');
            } else {
                // Error en la configuración de la petición
                console.error('Error de configuración:', error.message);
                toast.error('Error al procesar la solicitud');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Iniciar Sesión
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Contraseña</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Contraseña"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {loading ? (
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </span>
                            ) : null}
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                        ¿No tienes cuenta? Regístrate
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login; 