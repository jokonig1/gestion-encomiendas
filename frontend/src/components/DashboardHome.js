import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const DashboardHome = () => {
  const [encomiendas, setEncomiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [formData, setFormData] = useState({
    departamento: '',
    tipo: '',
    comentarios: ''
  });

  // Función para cargar encomiendas pendientes
  const fetchEncomiendas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/encomiendas?estado=pendiente', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEncomiendas(response.data.data);
    } catch (error) {
      console.error('Error al cargar encomiendas:', error);
      toast.error('Error al cargar las encomiendas pendientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncomiendas();
  }, []);

  // Función para marcar como entregado
  const handleMarcarRetirado = async (id) => {
    try {
      setProcessingId(id);
      const token = localStorage.getItem('token');
      await axios.put(`/api/encomiendas/${id}`,
        { estado: 'entregado' },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      toast.success('Encomienda marcada como retirada');
      fetchEncomiendas();
    } catch (error) {
      console.error('Error al actualizar encomienda:', error);
      toast.error('Error al actualizar el estado de la encomienda');
    } finally {
      setProcessingId(null);
    }
  };

  // Funciones para el formulario de registro
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.departamento || !formData.tipo) {
      toast.error('Por favor complete los campos requeridos');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/encomiendas', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success('Encomienda registrada exitosamente');
        setFormData({
          departamento: '',
          tipo: '',
          comentarios: ''
        });
        fetchEncomiendas();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al registrar la encomienda';
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha no disponible';
      }
      return format(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'Fecha no disponible';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Panel de Encomiendas Pendientes */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Encomiendas Pendientes</h2>
          <Link
            to="/dashboard/conserje/encomiendas-pendientes"
            className="text-blue-600 hover:text-blue-800"
          >
            Ver todas
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : encomiendas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay encomiendas pendientes
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Depto.</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {encomiendas.slice(0, 5).map((encomienda) => (
                  <tr key={encomienda._id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{encomienda.departamento}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">{encomienda.tipo}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(encomienda.fechaRegistro)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleMarcarRetirado(encomienda._id)}
                        disabled={processingId === encomienda._id}
                        className={`text-indigo-600 hover:text-indigo-900 ${
                          processingId === encomienda._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {processingId === encomienda._id ? 'Procesando...' : 'Marcar retirado'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panel de Registro Rápido */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Registro Rápido</h2>
          <Link
            to="/dashboard/conserje/nueva-encomienda"
            className="text-blue-600 hover:text-blue-800"
          >
            Formulario completo
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento *
            </label>
            <input
              type="text"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: 101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Paquete *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Seleccione un tipo</option>
              <option value="comida">Comida</option>
              <option value="supermercado">Supermercado</option>
              <option value="general">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentarios
            </label>
            <textarea
              name="comentarios"
              value={formData.comentarios}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows="2"
              placeholder="Información adicional"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardHome; 