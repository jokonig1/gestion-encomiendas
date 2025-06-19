import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';
import PackageDetails from '../../components/shared/PackageDetails';
import PackageHistory from '../../components/shared/PackageHistory';

const HistorialEncomiendas = () => {
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [filters, setFilters] = useState({
    departamento: '',
    destinatario: '',
    fechaInicio: '',
    fechaFin: ''
  });

  useEffect(() => {
    fetchHistorial();
  }, [filters]);

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/encomiendas', { params: filters });
      setHistorial(response.data.data);
    } catch (error) {
      console.error('Error al obtener historial de encomiendas:', error);
      toast.error('Error al cargar el historial de encomiendas');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Historial de Encomiendas</h1>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Departamento</label>
            <input
              type="text"
              name="departamento"
              value={filters.departamento}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Buscar por departamento"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Destinatario</label>
            <input
              type="text"
              name="destinatario"
              value={filters.destinatario}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Buscar por nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
            <input
              type="date"
              name="fechaInicio"
              value={filters.fechaInicio}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
            <input
              type="date"
              name="fechaFin"
              value={filters.fechaFin}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Historial */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Tabla para pantallas grandes (md y superiores) */}
        <div className="hidden md:block overflow-x-auto">
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
                  Fecha Ingreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Entrega
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
              {historial.length > 0 ? (historial.map((paquete) => (
                <tr key={paquete._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{paquete.departamento}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{paquete.tipo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(paquete.fechaIngreso).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{paquete.fechaRetiro ? new Date(paquete.fechaRetiro).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paquete.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {paquete.estado}
                    </span>
                    {paquete.isUrgente && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Urgente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => setSelectedPackage(paquete)}
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))): (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No hay encomiendas históricas disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tarjetas para pantallas pequeñas (menores a md) */}
        <div className="block md:hidden p-4 space-y-2">
          {historial.length > 0 ? (
            historial.map((paquete) => (
              <div key={paquete._id} className="bg-white rounded p-4 shadow mb-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Departamento</p>
                      <p className="text-sm text-gray-700">{paquete.departamento}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paquete.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {paquete.estado}
                      </span>
                      {paquete.isUrgente && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Urgente
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Tipo</p>
                    <p className="text-sm text-gray-700">{paquete.tipo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Fecha Ingreso</p>
                    <p className="text-sm text-gray-700">{new Date(paquete.fechaIngreso).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Fecha Entrega</p>
                    <p className="text-sm text-gray-700">{paquete.fechaRetiro ? new Date(paquete.fechaRetiro).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="pt-2">
                    <button 
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      onClick={() => setSelectedPackage(paquete)}
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No hay encomiendas históricas disponibles.</p>
          )}
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Detalles del Paquete</h2>
              <button 
                className="text-gray-400 hover:text-gray-500 absolute top-4 right-4"
                onClick={() => setSelectedPackage(null)}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">ID del Paquete</p>
                  <p className="text-sm text-gray-700 break-all">{selectedPackage._id}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Tipo de Paquete</p>
                  <p className="text-sm text-gray-700 capitalize">{selectedPackage.tipo}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Fecha y Hora de Ingreso</p>
                  <p className="text-sm text-gray-700">{selectedPackage.fechaIngreso ? new Date(selectedPackage.fechaIngreso).toLocaleString() : '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Comentarios</p>
                  <p className="text-sm text-gray-700">{selectedPackage.comentarios || 'Sin comentarios'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold text-gray-900">Retiro</p>
                  {selectedPackage.estado === 'retirado' && selectedPackage.fechaRetiro ? (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700">Fecha y hora de retiro: {new Date(selectedPackage.fechaRetiro).toLocaleString()}</p>
                      <p className="text-sm text-gray-700">Retirado por: {selectedPackage.retiradoPor || 'Desconocido'}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-yellow-700">Este paquete no ha sido retirado aún.</p>
                  )}
                </div>
              </div>
              {selectedPackage.historial && selectedPackage.historial.length > 0 && (
                <PackageHistory historial={selectedPackage.historial} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialEncomiendas; 