import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// Configurar la URL base de axios si no está configurada
if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = 'http://localhost:5000';
}

const HistorialEncomiendas = () => {
  const [encomiendas, setEncomiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    departamento: '',
    fechaInicio: '',
    fechaFin: ''
  });
  const [departamentos, setDepartamentos] = useState([]);

  const fetchEncomiendas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let url = '/api/encomiendas?estado=entregado';
      
      // Aplicar filtros si existen
      if (filtros.departamento) {
        url += `&departamento=${filtros.departamento}`;
      }
      if (filtros.fechaInicio) {
        url += `&fechaInicio=${filtros.fechaInicio}`;
      }
      if (filtros.fechaFin) {
        url += `&fechaFin=${filtros.fechaFin}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setEncomiendas(response.data.data);
      
      // Extraer departamentos únicos para el filtro
      const deptos = [...new Set(response.data.data.map(e => e.departamento))];
      setDepartamentos(deptos.sort());
    } catch (error) {
      console.error('Error al cargar el historial:', error);
      toast.error('Error al cargar el historial de encomiendas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncomiendas();
  }, [filtros]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      departamento: '',
      fechaInicio: '',
      fechaFin: ''
    });
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm');
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
      <h2 className="text-2xl font-bold mb-6">Historial de Encomiendas</h2>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <select
              name="departamento"
              value={filtros.departamento}
              onChange={handleFiltroChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Todos los departamentos</option>
              {departamentos.map(depto => (
                <option key={depto} value={depto}>{depto}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFiltroChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleFiltroChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={limpiarFiltros}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
      
      {/* Tabla de encomiendas */}
      {encomiendas.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No hay encomiendas en el historial</p>
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
                    Fecha de Entrega
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
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
                      <div className="text-sm text-gray-900">
                        {encomienda.fechaEntrega ? formatDate(encomienda.fechaEntrega) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Entregado
                      </span>
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

export default HistorialEncomiendas; 