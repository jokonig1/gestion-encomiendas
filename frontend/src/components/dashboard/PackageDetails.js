import React from 'react';

const PackageDetails = ({ package: pkg, onClose, onMarkAsPickedUp }) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Detalles del Paquete</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Información General</h3>
            <div className="mt-2 space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Tipo:</span> {pkg.tipo}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Estado:</span>{' '}
                <span className={`px-2 py-1 rounded-full text-sm ${
                  pkg.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {pkg.estado === 'pendiente' ? 'Pendiente' : 'Entregado'}
                </span>
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Departamento:</span> {pkg.departamento}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Fecha de registro:</span>{' '}
                {formatDate(pkg.fechaRegistro)}
              </p>
              {pkg.fechaEntrega && (
                <p className="text-gray-600">
                  <span className="font-medium">Fecha de entrega:</span>{' '}
                  {formatDate(pkg.fechaEntrega)}
                </p>
              )}
            </div>
          </div>

          {pkg.comentarios && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Comentarios</h3>
              <p className="mt-2 text-gray-600">{pkg.comentarios}</p>
            </div>
          )}

          {pkg.estado === 'pendiente' && (
            <div className="mt-6">
              <button
                onClick={() => onMarkAsPickedUp(pkg._id)}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors duration-200"
              >
                Marcar como retirado
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageDetails; 