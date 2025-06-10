import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../config/api';
import PackageDetails from '../../components/shared/PackageDetails';

const Inicio = () => {
  const [paquetesPendientes, setPaquetesPendientes] = useState([]);
  const [stats, setStats] = useState({
    paquetesPendientesCount: 0,
    paquetesRetiradosMes: 0,
    reclamosActivosCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showReportProblemModal, setShowReportProblemModal] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          toast.error('No se encontró información del usuario. Por favor, inicia sesión de nuevo.');
          setLoading(false);
          return;
        }

        // Fetch paquetes pendientes
        const paquetesResponse = await api.get(`/api/encomiendas/usuario/${user.id}`, {
          params: { estado: 'pendiente' }
        });
        setPaquetesPendientes(paquetesResponse.data);
        setStats(prevStats => ({ ...prevStats, paquetesPendientesCount: paquetesResponse.data.length }));

        // Notificaciones
        handleNotifications(user.id);

        // Fetch estadísticas (ej: paquetes retirados este mes, reclamos activos)
        const [retiradosRes, reclamosRes] = await Promise.all([
          api.get(`/api/encomiendas/usuario/${user.id}`, { params: { estado: 'retirado', period: 'month' } }),
          api.get(`/api/reclamos/usuario/${user.id}`, { params: { estado: 'activo' } })
        ]);
        setStats(prevStats => ({
          ...prevStats,
          paquetesRetiradosMes: retiradosRes.data.length,
          reclamosActivosCount: reclamosRes.data.length
        }));

      } catch (error) {
        console.error('Error al cargar datos del dashboard para el residente:', error);
        toast.error('Error al cargar los datos del panel de control.');
      } finally {
        setLoading(false);
      }
    };

    // Función para manejar las notificaciones
    const handleNotifications = async (userId) => {
      try {
        // Notificaciones normales (una sola vez por encomienda nueva)
        const unnotifiedRes = await api.get(`/api/encomiendas/usuario/${userId}/notificaciones/nuevas`);
        const unnotifiedPackageIds = unnotifiedRes.data.data.map(p => p._id);

        // Notificaciones insistentes (repetidas para paquetes urgentes no retirados)
        const urgentPendingRes = await api.get(`/api/encomiendas/usuario/${userId}/notificaciones/urgentes`);
        const urgentPendingPackagesToNotify = urgentPendingRes.data.data;

        // Mostrar notificación solo si hay paquetes no notificados
        if (unnotifiedPackageIds.length > 0) {
          // Mostrar notificación solo si no se ha mostrado ya en esta sesión
          if (!sessionStorage.getItem('newEncomiendaNotificationShown')) {
            sessionStorage.setItem('newEncomiendaNotificationShown', 'true'); // Establecer la bandera *antes* de mostrar el toast
            toast.info('Tienes una nueva encomienda registrada.', { toastId: 'newEncomiendaNotification' });
          }
          // Marcar como notificado
          await api.patch('/api/encomiendas/notificaciones/marcar-leido', { encomiendaIds: unnotifiedPackageIds });
        }
        // Mostrar notificación de urgente solo si no hay notificaciones normales y hay paquetes urgentes
        else if (urgentPendingPackagesToNotify.length > 0) {
          if (!toast.isActive('urgentEncomiendaNotification')) {
            toast.warn('Tienes un paquete urgente sin retirar. Por favor, retíralo lo antes posible.', { toastId: 'urgentEncomiendaNotification' });
          }
          // Actualizar ultimaNotificacion para cada paquete notificado
          await Promise.all(urgentPendingPackagesToNotify.map(p =>
            api.patch(`/api/encomiendas/${p._id}/ultima-notificacion`)
          ));
        }
      } catch (error) {
        console.error('Error al manejar notificaciones:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleReportProblem = (paquete) => {
    setSelectedPackage(paquete);
    setShowReportProblemModal(true);
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
      // No recargamos los paquetes pendientes aquí, el reclamo se gestiona por separado
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Panel de Control Residente</h1>

      {/* Sección de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Paquetes Pendientes */}
        <Link to="/dashboard/residente/activos" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Paquetes Pendientes</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.paquetesPendientesCount}</p>
          <p className="text-sm text-gray-500 mt-2">Pendientes de retiro</p>
        </Link>

        {/* Tarjeta de Paquetes Retirados este Mes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Retirados este Mes</h2>
          <p className="text-3xl font-bold text-green-600">{stats.paquetesRetiradosMes}</p>
          <p className="text-sm text-gray-500 mt-2">Paquetes retirados en el mes actual</p>
        </div>

        {/* Tarjeta de Reclamos Activos */}
        <Link to="/dashboard/residente/reclamos" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Reclamos Activos</h2>
          <p className="text-3xl font-bold text-red-600">{stats.reclamosActivosCount}</p>
          <p className="text-sm text-gray-500 mt-2">Reclamos pendientes de resolución</p>
        </Link>
      </div>

      {/* Sección de Paquetes Pendientes Detallados */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Listado de Paquetes Pendientes</h2>
        </div>
        <div className="p-6">
          {paquetesPendientes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Ingreso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código de Retiro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paquetesPendientes.map((paquete) => (
                    <tr key={paquete._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paquete.departamento}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paquete.tipo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(paquete.fechaIngreso).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          paquete.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          paquete.estado === 'retirado' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {paquete.estado.charAt(0).toUpperCase() + paquete.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-mono text-gray-700">{paquete.codigoRetiro}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedPackage(paquete)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
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
            <p className="text-gray-500 text-center py-4">No hay paquetes pendientes para tu departamento.</p>
          )}
          <div className="mt-4 text-center">
              <Link
                to="/dashboard/residente/activos"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todos mis paquetes activos →
              </Link>
            </div>
        </div>
      </div>

      {/* Modal de Detalles del Paquete */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Detalles del Paquete: {selectedPackage.codigo}</h2>
              <button 
                className="text-gray-400 hover:text-gray-500 absolute top-4 right-4"
                onClick={() => setSelectedPackage(null)}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <PackageDetails paquete={selectedPackage} onReportProblem={handleReportProblem} />
          </div>
        </div>
      )}

      {/* Modal para Reportar Problema */}
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
    </div>
  );
};

export default Inicio; 