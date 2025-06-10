import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';

const Perfil = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    departamento: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('No se encontró ID de usuario. Por favor, inicia sesión de nuevo.');
        setLoading(false);
        return;
      }
      const response = await api.get(`/api/auth/usuarios/${userId}`);
      const { nombre, email, departamento } = response.data;
      setFormData(prev => ({
        ...prev,
        nombre,
        email,
        departamento
      }));
    } catch (error) {
      console.error('Error al cargar datos del perfil:', error);
      toast.error('Error al cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>
        <div className="text-center py-4">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

      <form className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre Completo
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
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
            value={formData.email}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
          </p>
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
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
          />
        </div>
      </form>
    </div>
  );
};

export default Perfil; 