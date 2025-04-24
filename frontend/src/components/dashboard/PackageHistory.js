import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PackageHistory = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('No se encontró el ID de usuario');
          setLoading(false);
          return;
        }
        
        // Configurar el token en el encabezado de la petición
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Asegurarse de que la URL sea correcta y que el backend esté esperando estos parámetros
        const response = await axios.get(`${API_URL}/api/encomiendas/usuario/${userId}?estado=entregado`, config);
        
        // Verificar si la respuesta tiene la estructura esperada
        if (response.data && Array.isArray(response.data)) {
          // Sort packages by date in descending order
          const sortedPackages = response.data.sort((a, b) => 
            new Date(b.fechaEntrega) - new Date(a.fechaEntrega)
          );
          setPackages(sortedPackages);
        } else {
          console.error('Formato de respuesta inesperado:', response.data);
          setError('Error al procesar los datos del historial');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el historial:', err);
        setError('Error al cargar el historial. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const groupPackagesByDate = (packages) => {
    const groups = {};
    packages.forEach(pkg => {
      const date = new Date(pkg.fechaEntrega).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(pkg);
    });
    return groups;
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
        <h3 className="text-xl font-semibold text-gray-700">No hay historial de paquetes</h3>
        <p className="text-gray-500 mt-2">No tienes paquetes entregados en tu historial.</p>
      </div>
    );
  }

  const groupedPackages = groupPackagesByDate(packages);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Historial de Paquetes</h2>
      <div className="space-y-8">
        {Object.entries(groupedPackages).map(([date, datePackages]) => (
          <div key={date} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{date}</h3>
            <div className="space-y-4">
              {datePackages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{pkg.tipo}</h4>
                      <p className="text-sm text-gray-500">
                        ID de seguimiento: {pkg._id}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      Entregado
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Fecha de entrega: {new Date(pkg.fechaEntrega).toLocaleTimeString()}</p>
                    {pkg.comentarios && (
                      <p className="mt-1">Comentarios: {pkg.comentarios}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackageHistory; 