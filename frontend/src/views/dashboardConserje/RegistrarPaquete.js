import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../config/api';

const RegistrarPaquete = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    departamento: '',
    tipo: '',
    comentarios: '',
    isUrgente: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/encomiendas', formData);
      toast.success('Paquete registrado exitosamente');
      navigate('/conserje/paquetes-pendientes');
    } catch (error) {
      console.error('Error al registrar paquete:', error);
      toast.error(error.response?.data?.message || 'Error al registrar el paquete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Registrar Nuevo Paquete</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">
            Departamento
          </label>
          <input
            type="text"
            id="departamento"
            name="departamento"
            required
            value={formData.departamento}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ej: 101, 202, etc."
          />
        </div>

        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
            Tipo de Paquete
          </label>
          <select
            id="tipo"
            name="tipo"
            required
            value={formData.tipo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Seleccione un tipo</option>
            <option value="comida">Comida</option>
            <option value="supermercado">Supermercado</option>
            <option value="general">General</option>
          </select>
        </div>

        <div>
          <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700">
            Comentarios (opcional)
          </label>
          <textarea
            id="comentarios"
            name="comentarios"
            value={formData.comentarios}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Información adicional sobre el paquete..."
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isUrgente"
            name="isUrgente"
            checked={formData.isUrgente}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isUrgente" className="ml-2 block text-sm text-gray-900">
            Marcar como urgente
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/conserje/paquetes-pendientes')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrar Paquete'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrarPaquete; 