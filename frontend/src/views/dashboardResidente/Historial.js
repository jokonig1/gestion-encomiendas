import React, { useState, useEffect } from 'react';
import PackageHistory from '../../components/shared/PackageHistory';
import api from '../../config/api';
import { toast } from 'react-toastify';

const Historial = () => {
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [filter, setFilter] = useState({
    tipo: '',
    departamento: '',
    fechaInicio: '',
    fechaFin: ''
  });

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          toast.error('No se encontró información del usuario para cargar el historial.');
          setLoading(false);
          return;
        }

        const response = await api.get(`/api/encomiendas/usuario/${user.id}`, {
          params: {
            tipo: filter.tipo,
            departamento: filter.departamento,
            fechaInicio: filter.fechaInicio,
            fechaFin: filter.fechaFin
          }
        });
        setPaquetes(response.data);
      } catch (error) {
        console.error('Error al obtener historial:', error);
        toast.error('Error al cargar el historial de paquetes');
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [filter]);

  const handleChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  // Función para transformar los datos de la encomienda a un formato de historial
  const mapEncomiendaToHistory = (encomienda) => {
    const historyEvents = [];

    if (encomienda.fechaIngreso) {
      historyEvents.push({
        tipo: 'recepcion',
        descripcion: `Paquete recibido en conserjería para el Departamento ${encomienda.departamento} (Tipo: ${encomienda.tipo})`,
        fecha: new Date(encomienda.fechaIngreso).toLocaleString()
      });
    }

    if (encomienda.estado === 'retirado' && encomienda.fechaRetiro) {
      historyEvents.push({
        tipo: 'entrega',
        descripcion: `Paquete retirado por el residente del Departamento ${encomienda.departamento}`,
        fecha: new Date(encomienda.fechaRetiro).toLocaleString()
      });
    }

    if (encomienda.estado === 'extraviado') {
      historyEvents.push({
        tipo: 'problema',
        descripcion: `Paquete extraviado. Comentarios: ${encomienda.comentarios || 'N/A'}`,
        fecha: new Date(encomienda.updatedAt).toLocaleString()
      });
    }

    // Si hay comentarios generales, también se pueden añadir como un evento genérico
    if (encomienda.comentarios && encomienda.estado !== 'extraviado') {
      historyEvents.push({
        tipo: 'general',
        descripcion: `Comentarios: ${encomienda.comentarios}`,
        fecha: new Date(encomienda.updatedAt).toLocaleString()
      });
    }

    return historyEvents;
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
      <h1 className="text-2xl font-bold text-gray-900">Historial de Paquetes</h1>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Departamento</label>
            <input
              type="text"
              name="departamento"
              value={filter.departamento}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Filtrar por departamento"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Paquete</label>
            <select
              name="tipo"
              value={filter.tipo}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="comida">Comida</option>
              <option value="supermercado">Supermercado</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
            <input
              type="date"
              name="fechaInicio"
              value={filter.fechaInicio}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
            <input
              type="date"
              name="fechaFin"
              value={filter.fechaFin}
              onChange={handleChange}
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
                  Código
                </th>
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
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paquetes.length > 0 ? (
                paquetes.map((paquete) => (
                  <tr key={paquete._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{paquete.codigo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{paquete.departamento}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{paquete.tipo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(paquete.fechaIngreso).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        paquete.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        paquete.estado === 'retirado' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {paquete.estado.charAt(0).toUpperCase() + paquete.estado.slice(1)}
                      </span>
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
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                    No hay paquetes en el historial.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tarjetas para pantallas pequeñas (menores a md) */}
        <div className="block md:hidden p-4 space-y-2">
          {paquetes.length > 0 ? (
            paquetes.map((paquete) => (
              <div key={paquete._id} className="bg-white rounded p-4 shadow mb-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Código</p>
                      <p className="text-sm text-gray-700">{paquete.codigo}</p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      paquete.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      paquete.estado === 'retirado' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {paquete.estado.charAt(0).toUpperCase() + paquete.estado.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Departamento</p>
                    <p className="text-sm text-gray-700">{paquete.departamento}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Tipo</p>
                    <p className="text-sm text-gray-700">{paquete.tipo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Fecha Ingreso</p>
                    <p className="text-sm text-gray-700">{new Date(paquete.fechaIngreso).toLocaleDateString()}</p>
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
            <p className="text-gray-500 text-center py-4">No hay paquetes en el historial.</p>
          )}
        </div>
      </div>

      {/* Modal de Historial */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Detalles del Paquete</h2>
              <button 
                className="text-gray-400 hover:text-gray-500"
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
                  <p className="text-sm font-semibold text-gray-900">ID</p>
                  <p className="text-sm text-gray-700 break-all">{selectedPackage._id}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Tipo de Paquete</p>
                  <p className="text-sm text-gray-700 capitalize">{selectedPackage.tipo}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Hora de llegada</p>
                  <p className="text-sm text-gray-700">{selectedPackage.fechaIngreso ? new Date(selectedPackage.fechaIngreso).toLocaleString() : '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Hora de retiro</p>
                  <p className="text-sm text-gray-700">{selectedPackage.fechaRetiro ? new Date(selectedPackage.fechaRetiro).toLocaleString() : 'No retirado'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold text-gray-900">Retirado por</p>
                  <p className="text-sm text-gray-700">{selectedPackage.retiradoPor || 'No retirado'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold text-gray-900">Comentario del conserje</p>
                  <p className="text-sm text-gray-700">{selectedPackage.comentarios || 'Sin comentarios'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historial; 