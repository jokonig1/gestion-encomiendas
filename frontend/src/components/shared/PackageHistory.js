import React from 'react';

const PackageHistory = ({ historial }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Historial del Paquete</h3>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {historial.map((evento, index) => (
            <li key={index}>
              <div className="relative pb-8">
                {index !== historial.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                      evento.tipo === 'recepcion' ? 'bg-blue-500' :
                      evento.tipo === 'entrega' ? 'bg-green-500' :
                      evento.tipo === 'problema' ? 'bg-red-500' : 'bg-gray-500'
                    }`}>
                      {evento.tipo === 'recepcion' ? '📦' :
                       evento.tipo === 'entrega' ? '✓' :
                       evento.tipo === 'problema' ? '⚠' : '•'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        {evento.descripcion}
                      </p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      <time dateTime={evento.fecha}>{evento.fecha}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PackageHistory; 