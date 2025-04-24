import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('No se encontró el ID de usuario');
          setLoading(false);
          return;
        }
        
        // Configurar el token en el encabezado de la petición
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Asegurarse de que la URL sea correcta
        const response = await axios.get(`${API_URL}/api/usuarios/${userId}`, config);
        
        if (response.data) {
          setUserData(response.data);
          setFormData({
            nombre: response.data.nombre || '',
            email: response.data.email || '',
            telefono: response.data.telefono || '',
            direccion: response.data.direccion || ''
          });
        } else {
          setError('No se pudo cargar la información del usuario');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
        setError('Error al cargar el perfil. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      nombre: userData.nombre || '',
      email: userData.email || '',
      telefono: userData.telefono || '',
      direccion: userData.direccion || ''
    });
  };

  const handleSaveProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      await axios.put(`${API_URL}/api/usuarios/${userId}`, formData, config);
      
      setUserData({
        ...userData,
        ...formData
      });
      
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      console.error('Error al actualizar el perfil:', err);
      toast.error('Error al actualizar el perfil');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Mi Perfil</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            {isEditing ? (
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-lg text-gray-900">{userData?.nombre}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-lg text-gray-900">{userData?.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            {isEditing ? (
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-lg text-gray-900">{userData?.telefono}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            {isEditing ? (
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-lg text-gray-900">{userData?.direccion}</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex space-x-4">
          {isEditing ? (
            <>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
                onClick={handleSaveProfile}
              >
                Guardar Cambios
              </button>
              <button
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-200"
                onClick={handleCancelEdit}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
              onClick={handleEditClick}
            >
              Editar Perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 