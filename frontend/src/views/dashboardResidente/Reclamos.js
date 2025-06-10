import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';

const Reclamos = () => {
  const [loading, setLoading] = useState(true);
  const [reclamos, setReclamos] = useState([]);
  const [showFullDescriptionModal, setShowFullDescriptionModal] = useState(false);
  const [fullDescription, setFullDescription] = useState('');
  const [showFullResolutionModal, setShowFullResolutionModal] = useState(false);
  const [fullResolution, setFullResolution] = useState('');

  useEffect(() => {
    cargarReclamos();
  }, []);

  const cargarReclamos = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        toast.error('No se encontró información del usuario. Por favor, inicia sesión de nuevo.');
        setLoading(false);
        return;
      }

      const response = await api.get(`/api/reclamos/usuario/${user.id}`);
      setReclamos(response.data || []);
    } catch (error) {
      console.error('Error al cargar reclamos:', error);
      toast.error('Error al cargar los reclamos');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMoreDescription = (description) => {
    setFullDescription(description);
    setShowFullDescriptionModal(true);
  };

  const handleViewMoreResolution = (resolution) => {
    setFullResolution(resolution);
    setShowFullResolutionModal(true);
  };

  const truncateDescription = (description, maxLength) => {
    if (description.length > maxLength) {
      return description.substring(0, maxLength) + '...';
    }
    return description;
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Reclamos</h1>

      {/* Historial de Reclamos */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Historial de Reclamos</h2>
        </div>
        <div className="p-6">
          {reclamos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Encomienda</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolución</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reclamos.map((reclamo) => (
                    <tr key={reclamo._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reclamo.encomienda ? `Depto: ${reclamo.encomienda.departamento}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {truncateDescription(reclamo.descripcion, 50)}
                        {reclamo.descripcion.length > 50 && (
                          <button 
                            className="text-blue-600 hover:text-blue-900 ml-2"
                            onClick={() => handleViewMoreDescription(reclamo.descripcion)}
                          >
                            Ver más
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reclamo.estado === 'pendiente' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {reclamo.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reclamo.fechaCreacion).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {reclamo.resolucion ? (
                          <>
                            {truncateDescription(reclamo.resolucion, 50)}
                            {reclamo.resolucion.length > 50 && (
                              <button 
                                className="text-blue-600 hover:text-blue-900 ml-2"
                                onClick={() => handleViewMoreResolution(reclamo.resolucion)}
                              >
                                Ver más
                              </button>
                            )}
                          </>
                        ) : 'Pendiente de respuesta'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay reclamos registrados</p>
          )}
        </div>
      </div>

      {/* Modal para ver descripción completa */}
      {showFullDescriptionModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Descripción del Reclamo</h2>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowFullDescriptionModal(false)}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{fullDescription}</p>
          </div>
        </div>
      )}

      {/* Modal para ver resolución completa */}
      {showFullResolutionModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Resolución del Reclamo</h2>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowFullResolutionModal(false)}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{fullResolution}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reclamos; 