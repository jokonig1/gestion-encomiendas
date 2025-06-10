import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';

const ReclamosConserje = () => {
  const [loading, setLoading] = useState(true);
  const [resolvingClaim, setResolvingClaim] = useState(false);
  const [reclamos, setReclamos] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [showFullDescriptionModal, setShowFullDescriptionModal] = useState(false);
  const [fullDescription, setFullDescription] = useState('');
  const [showFullResolutionModal, setShowFullResolutionModal] = useState(false);
  const [fullResolution, setFullResolution] = useState('');

  useEffect(() => {
    fetchReclamos();
  }, []);

  const fetchReclamos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/reclamos'); // Obtener todos los reclamos
      console.log('API Response for /api/reclamos:', response.data);
      setReclamos(response.data || []);
    } catch (error) {
      console.error('Error al cargar reclamos:', error);
      toast.error('Error al cargar los reclamos.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveClaim = async (e) => {
    e.preventDefault();
    if (!resolutionMessage.trim()) {
      toast.error('Por favor, ingresa un mensaje de resolución.');
      return;
    }
    setResolvingClaim(true);
    try {
      await api.put(`/api/reclamos/${selectedClaim._id}/resolver`, { resolucion: resolutionMessage });
      toast.success('Reclamo resuelto exitosamente.');
      setSelectedClaim(null);
      setResolutionMessage('');
      fetchReclamos(); // Recargar la lista de reclamos
    } catch (error) {
      console.error('Error al resolver reclamo:', error);
      toast.error(error.response?.data?.message || 'Error al resolver el reclamo.');
    } finally {
      setResolvingClaim(false);
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

  // Separar reclamos pendientes y resueltos
  const reclamosPendientes = reclamos.filter(r => r.estado === 'pendiente');
  const reclamosResueltos = reclamos.filter(r => r.estado === 'resuelto');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Reclamos</h1>

      {/* Reclamos Pendientes */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Reclamos Pendientes</h2>
        </div>
        <div className="p-6">
          {reclamosPendientes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Encomienda</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolución</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reclamosPendientes.map((reclamo) => (
                    <tr key={reclamo._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reclamo.encomienda ? `Depto: ${reclamo.encomienda.departamento}` : 'N/A'}</td>
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800`}>
                          {reclamo.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(reclamo.fechaCreacion).toLocaleDateString()}</td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {reclamo.estado === 'pendiente' && (
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => setSelectedClaim(reclamo)}
                          >
                            Resolver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay reclamos pendientes.</p>
          )}
        </div>
      </div>

      {/* Historial de Reclamos Resueltos */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Historial de Reclamos Resueltos</h2>
        </div>
        <div className="p-6">
          {reclamosResueltos.length > 0 ? (
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
                  {reclamosResueltos.map((reclamo) => (
                    <tr key={reclamo._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reclamo.encomienda ? `Depto: ${reclamo.encomienda.departamento}` : 'N/A'}</td>
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>
                          {reclamo.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(reclamo.fechaCreacion).toLocaleDateString()}</td>
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
            <p className="text-gray-500 text-center py-4">No hay reclamos resueltos.</p>
          )}
        </div>
      </div>

      {/* Modal para resolver reclamo */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Resolver Reclamo</h2>
              <button 
                className="text-gray-400 hover:text-gray-500 absolute top-4 right-4"
                onClick={() => setSelectedClaim(null)}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <p><strong>Asunto:</strong> {selectedClaim.asunto}</p>
              <p><strong>Descripción:</strong> {selectedClaim.descripcion}</p>
              <p><strong>Encomienda Asociada:</strong> {selectedClaim.encomienda ? `Cod: ${selectedClaim.encomienda.codigo} - Depto: ${selectedClaim.encomienda.departamento}` : 'N/A'}</p>
              <p><strong>Estado Actual:</strong> 
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  selectedClaim.estado === 'pendiente' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {selectedClaim.estado}
                </span>
              </p>
              <form onSubmit={handleResolveClaim} className="space-y-4">
                <div>
                  <label htmlFor="resolucion" className="block text-sm font-medium text-gray-700">Mensaje de Resolución</label>
                  <textarea
                    id="resolucion"
                    name="resolucion"
                    value={resolutionMessage}
                    onChange={(e) => setResolutionMessage(e.target.value)}
                    rows="4"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={resolvingClaim}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {resolvingClaim ? 'Resolviendo...' : 'Marcar como Resuelto'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver la descripción completa */}
      {showFullDescriptionModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Descripción Completa</h2>
              <button 
                className="text-gray-400 hover:text-gray-500 absolute top-4 right-4"
                onClick={() => setShowFullDescriptionModal(false)}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap" style={{ overflowWrap: 'break-word' }}>{fullDescription}</p>
          </div>
        </div>
      )}

      {/* Modal para ver la resolución completa */}
      {showFullResolutionModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Resolución Completa</h2>
              <button 
                className="text-gray-400 hover:text-gray-500 absolute top-4 right-4"
                onClick={() => setShowFullResolutionModal(false)}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap" style={{ overflowWrap: 'break-word' }}>{fullResolution}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReclamosConserje; 