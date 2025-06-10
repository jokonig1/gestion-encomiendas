import React, { useState, useEffect } from 'react';
import PackageDetails from '../../components/shared/PackageDetails';
import api from '../../config/api';
import { toast } from 'react-toastify';
// import { QRCodeCanvas } from 'qrcode.react'; // Eliminar o comentar la importación de QRCodeCanvas

const PaquetesActivos = () => {
  const [loading, setLoading] = useState(true);
  const [paquetesActivos, setPaquetesActivos] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showReportProblemModal, setShowReportProblemModal] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  // const [showQrModal, setShowQrModal] = useState(false); // Eliminar este estado
  // const [qrCodeValue, setQrCodeValue] = useState(''); // Eliminar este estado
  const [filter, setFilter] = useState({
    tipo: '',
    departamento: '',
    estado: 'pendiente' // Siempre pendientes para esta vista
  });

  useEffect(() => {
    cargarPaquetesActivos();
  }, []);

  const cargarPaquetesActivos = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        toast.error('No se encontró información del usuario. Por favor, inicia sesión de nuevo.');
        setLoading(false);
        return;
      }

      const paquetesResponse = await api.get(`/api/encomiendas/usuario/${user.id}`, {
        params: { estado: 'pendiente' }
      });
      setPaquetesActivos(paquetesResponse.data);
    } catch (error) {
      console.error('Error al cargar paquetes activos:', error);
      toast.error('Error al cargar los paquetes activos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  const handleReportProblem = async (paqueteId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        toast.error('No se encontró información del usuario. Por favor, inicia sesión de nuevo.');
        return;
      }

      await api.post('/api/reclamos', {
        tipo: 'problema',
        descripcion: 'Problema con la encomienda',
        usuarioId: user.id,
        encomiendaId: paqueteId
      });
      toast.success('Reclamo registrado exitosamente');
    } catch (error) {
      console.error('Error al reportar problema:', error);
      toast.error('Error al registrar el reclamo');
    }
  };

  const handleSendProblemReport = async (e) => {
    e.preventDefault();
    if (!problemDescription.trim()) {
      toast.error('Por favor, ingresa una descripción del problema.');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        toast.error('No se encontró información del usuario. Por favor, inicia sesión de nuevo.');
        return;
      }
      await api.post('/api/reclamos', {
        asunto: `Problema con encomienda ${selectedPackage.codigo}`,
        descripcion: problemDescription,
        encomiendaId: selectedPackage._id,
        usuarioId: user.id
      });
      toast.success('Reclamo enviado exitosamente.');
      setShowReportProblemModal(false);
      setProblemDescription('');
      // No recargamos los paquetes activos aquí, el reclamo se gestiona por separado
    } catch (error) {
      console.error('Error al enviar reclamo:', error);
      toast.error(error.response?.data?.message || 'Error al enviar el reclamo.');
    }
  };

  const handleMarkAsRetired = (paquete) => {
    // Esta funcionalidad típicamente la realiza un conserje.
    // Para un residente, esto podría implicar una solicitud al conserje o un flujo diferente.
    toast.info(`La función 'Marcar como Retirado' para el paquete ${paquete.codigo} debe ser gestionada por el conserje.`);
    console.log('Intentando marcar como retirado paquete:', paquete);
  };

  // Eliminar o comentar la función handleShowQr
  // const handleShowQr = (codigoRetiro) => {
  //   setQrCodeValue(codigoRetiro);
  //   setShowQrModal(true);
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Paquetes Activos</h2>
      </div>
      <div className="p-6">
        {paquetesActivos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Departamento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paquetesActivos.map((paquete) => (
                  <tr key={paquete._id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{paquete.departamento}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{paquete.tipo}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {paquete.estado}
                        </span>
                        {paquete.isUrgente && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Urgente
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(paquete.fechaIngreso).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{paquete.codigoRetiro}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedPackage(paquete)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay paquetes activos</p>
        )}
      </div>

      {selectedPackage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Detalles del Paquete</h2>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setSelectedPackage(null)}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PackageDetails paquete={selectedPackage} onReportProblem={() => handleReportProblem(selectedPackage._id)} />
          </div>
        </div>
      )}

      {/* Modal para Reportar Problema (mantenerlo para la funcionalidad) */}
      {showReportProblemModal && selectedPackage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Reportar Problema con Encomienda {selectedPackage.codigo}</h2>
              <button 
                className="text-gray-400 hover:text-gray-500 absolute top-4 right-4"
                onClick={() => setShowReportProblemModal(false)}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSendProblemReport} className="space-y-4">
              <div>
                <label htmlFor="problemDescription" className="block text-sm font-medium text-gray-700">Descripción del Problema</label>
                <textarea
                  id="problemDescription"
                  name="problemDescription"
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Enviar Reporte
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Eliminar el QR Code Modal */}
      {/* {showQrModal && qrCodeValue && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 relative text-center">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Código QR de Retiro</h2>
              <button 
                className="text-gray-400 hover:text-gray-500 absolute top-4 right-4"
                onClick={() => setShowQrModal(false)}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="my-4 flex justify-center">
              <QRCodeCanvas value={qrCodeValue} size={256} level="H" includeMargin={true} />
            </div>
            <p className="text-sm text-gray-700">Muestra este código al conserje para retirar tu paquete.</p>
            <p className="mt-2 text-lg font-bold text-gray-900">Código: {qrCodeValue}</p>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default PaquetesActivos; 