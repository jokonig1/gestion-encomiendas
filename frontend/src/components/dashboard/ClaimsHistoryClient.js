import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ClaimsHistoryClient = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimInModal, setClaimInModal] = useState(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      console.log('=== Inicio fetchClaims (Client History) ===');
      console.log('Fetching claims for userId:', userId);
      console.log('Token available:', !!token);

      if (!userId) {
        setError('No se encontró el ID de usuario');
        setLoading(false);
        console.error('Error: userId not found in localStorage.');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const url = `${API_URL}/api/reclamos/usuario/${userId}`;
      console.log('Fetching claims from URL:', url);

      const response = await axios.get(url, config);

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      const sortedClaims = response.data.sort((a, b) => 
        new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
      );
      setClaims(sortedClaims);
      setLoading(false);
      console.log('Claims fetched successfully. Count:', sortedClaims.length);

    } catch (err) {
      console.error('Error al cargar historial de reclamos:', err);
      console.error('Error message:', err.message);
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
      }
      setError('Error al cargar el historial de reclamos.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const openDescriptionModal = (claim) => {
    setClaimInModal(claim);
  };

  const closeDescriptionModal = () => {
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

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Mi Historial de Reclamos</h2>

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
          <p className="text-gray-500">No has registrado ningún reclamo aún.</p>
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
                    Descripción
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
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                         <p className="overflow-hidden text-overflow-ellipsis whitespace-nowrap">{claim.descripcion.substring(0, 100)}{claim.descripcion.length > 100 ? '...' : ''}</p>
                         {claim.descripcion.length > 100 && (
                           <button 
                             onClick={() => openDescriptionModal(claim)}
                             className="text-blue-600 hover:text-blue-800 text-xs mt-1 focus:outline-none"
                           >
                             Ver descripción completa
                           </button>
                         )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {claimInModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center" onClick={closeDescriptionModal}>
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
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

export default ClaimsHistoryClient; 