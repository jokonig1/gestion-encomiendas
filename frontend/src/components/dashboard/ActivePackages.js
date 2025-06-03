import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PackageDetails from './PackageDetails';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ActivePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [reclamoData, setReclamoData] = useState({});
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const userId = localStorage.getItem('userId');
        console.log('=== Inicio fetchPackages ===');
        console.log('userId:', userId);
        
        if (!userId) {
          setError('No se encontró el ID de usuario');
          setLoading(false);
          return;
        }
        
        // Configurar el token en el encabezado de la petición
        const token = localStorage.getItem('token');
        console.log('Token disponible:', !!token);
        
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Asegurarse de que la URL sea correcta y que el backend esté esperando estos parámetros
        const url = `${API_URL}/api/encomiendas/usuario/${userId}?estado=pendiente`;
        console.log('URL de la petición:', url);
        
        const response = await axios.get(url, config);
        console.log('Respuesta del servidor:', response.data);
        
        // Verificar si la respuesta tiene la estructura esperada
        if (response.data && Array.isArray(response.data)) {
          console.log('Paquetes encontrados:', response.data.length);
          setPackages(response.data);
        } else {
          console.error('Formato de respuesta inesperado:', response.data);
          setError('Error al procesar los datos de los paquetes');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error completo:', err);
        console.error('Mensaje de error:', err.message);
        if (err.response) {
          console.error('Datos de la respuesta de error:', err.response.data);
          console.error('Estado de la respuesta de error:', err.response.status);
        }
        setError('Error al cargar los paquetes. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handlePackageClick = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleCloseModal = () => {
    setSelectedPackage(null);
    setReclamoData({});
  };

  const handleReclamoChange = (e, packageId) => {
    setReclamoData(prev => ({
      ...prev,
      [packageId]: e.target.value
    }));
  };

  const handleMarkAsPickedUp = async (pkgId) => {
    try {
      setProcessingId(pkgId);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const descripcionReclamo = reclamoData[pkgId];
      if (descripcionReclamo) {
        console.log('Registrando reclamo para paquete:', pkgId);
        await axios.post(`${API_URL}/api/reclamos`, { encomiendaId: pkgId, descripcion: descripcionReclamo }, config);
        toast.success('Reclamo registrado exitosamente');
      }

      console.log('Marcando paquete como retirado:', pkgId);
      await axios.put(`${API_URL}/api/encomiendas/${pkgId}/retirar`, {}, config);
      toast.success('Paquete marcado como retirado correctamente');

      setPackages(packages.filter(pkg => pkg._id !== pkgId));
      setSelectedPackage(null);
      setReclamoData(prev => {
        const newState = { ...prev };
        delete newState[pkgId];
        return newState;
      });

    } catch (err) {
      console.error('Error al marcar el paquete como retirado o registrar reclamo:', err);
      const errorMessage = err.response?.data?.message || 'Error al procesar la solicitud';
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha no disponible';
      }
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'Fecha no disponible';
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
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-semibold text-gray-700">No hay paquetes activos</h3>
        <p className="text-gray-500 mt-2">No tienes paquetes pendientes de retiro en este momento.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Paquetes Activos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg._id} className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Encomienda: {pkg.tipo}</h3>
            <p className="text-gray-700 mb-1">Departamento: {pkg.departamento}</p>
            <p className="text-gray-700 text-sm">Llegada: {formatDate(pkg.fechaRegistro)}</p>
            <button
              className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
              onClick={() => handlePackageClick(pkg)}
            >
              Ver detalles
            </button>
          </div>
        ))}
      </div>

      {selectedPackage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={handleCloseModal}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Detalles de Encomienda</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">Código: {selectedPackage.codigo || selectedPackage._id}</p>
                <p className="text-sm text-gray-500">Departamento: {selectedPackage.departamento}</p>
                <p className="text-sm text-gray-500">Tipo: {selectedPackage.tipo}</p>
                <p className="text-sm text-gray-500">Llegada: {formatDate(selectedPackage.fechaRegistro)}</p>
                {selectedPackage.comentarios && (
                  <p className="text-sm text-gray-500">Comentarios: {selectedPackage.comentarios}</p>
                )}
              </div>

              <div className="mt-4">
                <label htmlFor="reclamo" className="block text-sm font-medium text-gray-700 text-left">¿Tiene algún reclamo?</label>
                <textarea
                  id="reclamo"
                  name="reclamo"
                  rows="3"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                  value={reclamoData[selectedPackage._id] || ''}
                  onChange={(e) => handleReclamoChange(e, selectedPackage._id)}
                  placeholder="Escriba su reclamo aquí (opcional)"
                ></textarea>
              </div>

              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => handleMarkAsPickedUp(selectedPackage._id)}
                  disabled={processingId === selectedPackage._id}
                >
                  {processingId === selectedPackage._id ? 'Procesando...' : 'Marcar como Retirado'}
                </button>
                <button
                  id="cancel-btn"
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivePackages; 