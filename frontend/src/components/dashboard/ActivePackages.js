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
  };

  const handleMarkAsPickedUp = async (pkgId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      await axios.put(`${API_URL}/api/encomiendas/${pkgId}/retirar`, {}, config);
      toast.success('Paquete marcado como retirado correctamente');
      
      // Actualizar la lista de paquetes
      setPackages(packages.filter(pkg => pkg._id !== pkgId));
      setSelectedPackage(null);
    } catch (err) {
      console.error('Error al marcar el paquete como retirado:', err);
      toast.error('Error al marcar el paquete como retirado');
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
    <div>
      <h2 className="text-2xl font-bold mb-6">Paquetes Activos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => handlePackageClick(pkg)}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{pkg.tipo}</h3>
              <span className={`px-3 py-1 rounded-full text-sm ${
                pkg.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {pkg.estado === 'pendiente' ? 'Pendiente' : 'Entregado'}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Fecha de registro:</span>{' '}
                {formatDate(pkg.fechaRegistro)}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Departamento:</span> {pkg.departamento}
              </p>
              {pkg.comentarios && (
                <p className="text-gray-600">
                  <span className="font-medium">Comentarios:</span> {pkg.comentarios}
                </p>
              )}
            </div>
            <button
              className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              Ver detalles
            </button>
          </div>
        ))}
      </div>

      {selectedPackage && (
        <PackageDetails 
          package={selectedPackage} 
          onClose={handleCloseModal}
          onMarkAsPickedUp={handleMarkAsPickedUp}
        />
      )}
    </div>
  );
};

export default ActivePackages; 