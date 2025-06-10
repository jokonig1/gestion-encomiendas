import React from 'react';

const PackageDetails = ({ paquete, onReportProblem }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles del Paquete</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">ID del Paquete</label>
          <p className="mt-1 text-sm text-gray-900">{paquete._id}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Paquete</label>
          <p className="mt-1 text-sm text-gray-900">{paquete.tipo}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha y Hora de Llegada</label>
          <p className="mt-1 text-sm text-gray-900">{new Date(paquete.fechaIngreso).toLocaleString()}</p>
        </div>

        {paquete.comentarios && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Comentarios</label>
            <p className="mt-1 text-sm text-gray-900">{paquete.comentarios}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Departamento</label>
          <p className="mt-1 text-sm text-gray-900">{paquete.departamento}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <p className="mt-1">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              paquete.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {paquete.estado}
            </span>
            {paquete.isUrgente && (
              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                Urgente
              </span>
            )}
          </p>
        </div>

        {paquete.fechaEntrega && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Entrega</label>
            <p className="mt-1 text-sm text-gray-900">{new Date(paquete.fechaEntrega).toLocaleString()}</p>
          </div>
        )}

        {onReportProblem && paquete.estado === 'pendiente' && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => onReportProblem(paquete)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Reportar Problema
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageDetails; 