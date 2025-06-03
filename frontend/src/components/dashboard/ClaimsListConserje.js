import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ClaimsListConserje = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null); // Para deshabilitar el botón al resolver
  const [claimInModal, setClaimInModal] = useState(null); // Estado para el reclamo en el modal

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      console.log('=== Inicio fetchClaims (Conserje Claims) ===');
      console.log('User role:', user?.role);
      console.log('Token available:', !!token);

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const url = `${API_URL}/api/reclamos`;
      console.log('Fetching all claims from URL:', url);

      const response = await axios.get(url, config);

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      setClaims(response.data);
      setLoading(false);
      console.log('Claims fetched successfully. Count:', response.data.length);

    } catch (err) {
      console.error('Error al cargar reclamos:', err);
      console.error('Error message:', err.message);
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
      }
      setError('Error al cargar los reclamos.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleMarkAsResolved = async (claimId) => {
    try {
      setProcessingId(claimId);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.put(`${API_URL}/api/reclamos/${claimId}/resolver`, {}, config);
      toast.success('Reclamo marcado como resuelto');

      setClaims(claims.map(claim => 
        claim._id === claimId ? { ...claim, estado: 'resuelto', fechaResolucion: new Date() } : claim
      ));
    } catch (err) {
      console.error('Error al marcar reclamo como resuelto:', err);
      toast.error('Error al marcar el reclamo como resuelto.');
    } finally {
      setProcessingId(null);
    }
  };

  const openDescriptionModal = (claim) => { // Función para abrir el modal
    setClaimInModal(claim);
  };

  const closeDescriptionModal = () => { // Función para cerrar el modal
    setClaimInModal(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return format(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
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
          onClick={() => fetchClaims()} 
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lista de Reclamos</h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center p-4">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => fetchClaims()} 
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No hay reclamos registrados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Resolución
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reclamante (Depto)
                  </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.map(claim => (
                  <tr key={claim._id}>
                     <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${claim.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {claim.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(claim.fechaCreacion)}
                      </div>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900">
                         {claim.fechaResolucion ? formatDate(claim.fechaResolucion) : 'N/A'}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900">
                         {claim.usuario ? `${claim.usuario.nombre} (${claim.usuario.departamento})` : 'N/A'}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                         <p className="overflow-hidden text-overflow-ellipsis whitespace-nowrap">{claim.descripcion.substring(0, 100)}{claim.descripcion.length > 100 ? '...' : ''}</p>
                         {claim.descripcion.length > 100 && (
                           <button 
                             onClick={() => openDescriptionModal(claim)} // Llama a la función para abrir modal
                             className="text-blue-600 hover:text-blue-800 text-xs mt-1 focus:outline-none"
                           >
                             Ver descripción completa
                           </button>
                         )}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {claim.estado === 'pendiente' && (
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                          onClick={() => handleMarkAsResolved(claim._id)}
                          disabled={processingId === claim._id}
                        >
                          {processingId === claim._id ? 'Resolviendo...' : 'Resolver'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para ver descripción completa */}
      {claimInModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center" onClick={closeDescriptionModal}>
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}> {/* Evitar que el clic en el modal cierre la ventana */}
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Descripción del Reclamo</h3>
              <div className="mt-2 px-7 py-3 text-sm text-gray-500 text-left">
                <p className="whitespace-pre-wrap break-words">{claimInModal.descripcion}</p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="close-modal-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={closeDescriptionModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsListConserje; 