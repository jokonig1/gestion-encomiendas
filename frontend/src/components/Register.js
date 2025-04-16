import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        role: 'residente',
        departamento: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        
        // Limpiar error cuando el usuario modifica el campo
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validar email
        if (!formData.email) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }
        
        // Validar contraseña
        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }
        
        // Validar confirmación de contraseña
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }
        
        // Validar nombre
        if (!formData.nombre) {
            newErrors.nombre = 'El nombre es requerido';
        }
        
        // Validar departamento si es residente
        if (formData.role === 'residente' && !formData.departamento) {
            newErrors.departamento = 'El departamento es requerido para residentes';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);

        try {
            // Eliminar confirmPassword antes de enviar
            const { confirmPassword, ...dataToSend } = formData;
            
            const response = await axios.post('http://localhost:5000/api/auth/register', dataToSend);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            toast.success('¡Registro exitoso!');
            
            // Redirigir según el rol
            if (response.data.user.role === 'conserje') {
                navigate('/dashboard/conserje');
            } else {
                navigate('/dashboard/residente');
            }
        } catch (error) {
            console.error('Error de registro:', error);
            toast.error(error.response?.data?.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Crear una cuenta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Iniciar sesión
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className="error-message">{errors.email}</p>}
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="form-label">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password && <p className="error-message">{errors.password}</p>}
                        </div>
                        
                        <div>
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirmar Contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                        </div>
                        
                        <div>
                            <label htmlFor="nombre" className="form-label">
                                Nombre Completo
                            </label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                required
                                className={`input-field ${errors.nombre ? 'border-red-500' : ''}`}
                                value={formData.nombre}
                                onChange={handleChange}
                            />
                            {errors.nombre && <p className="error-message">{errors.nombre}</p>}
                        </div>
                        
                        <div>
                            <label htmlFor="role" className="form-label">
                                Rol
                            </label>
                            <select
                                id="role"
                                name="role"
                                className="input-field"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="residente">Residente</option>
                                <option value="conserje">Conserje</option>
                            </select>
                        </div>
                        
                        {formData.role === 'residente' && (
                            <div>
                                <label htmlFor="departamento" className="form-label">
                                    Departamento
                                </label>
                                <input
                                    id="departamento"
                                    name="departamento"
                                    type="text"
                                    required
                                    className={`input-field ${errors.departamento ? 'border-red-500' : ''}`}
                                    value={formData.departamento}
                                    onChange={handleChange}
                                />
                                {errors.departamento && <p className="error-message">{errors.departamento}</p>}
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Cargando...
                                </span>
                            ) : (
                                'Registrarse'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register; 