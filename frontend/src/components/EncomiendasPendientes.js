import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// Configurar la URL base de axios si no está configurada
if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = 'http://localhost:5000';
}

const EncomiendasPendientes = () => {
  const [encomiendas, setEncomiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchEncomiendas = async () => {
    try {
      setLoading(true);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-6">Encomiendas Pendientes</h2>
      
      {encomiendas.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No hay encomiendas pendientes</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {encomiendas.map((encomienda) => (
                  <tr key={encomienda._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {encomienda.departamento}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {encomienda.tipo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(encomienda.fechaRegistro)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pendiente
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleMarcarRetirado(encomienda._id)}
                        disabled={processingId === encomienda._id}
                        className={`text-indigo-600 hover:text-indigo-900 ${
                          processingId === encomienda._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {processingId === encomienda._id ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                          </span>
                        ) : (
                          'Marcar como Retirado'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncomiendasPendientes; 