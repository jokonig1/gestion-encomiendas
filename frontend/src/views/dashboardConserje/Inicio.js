import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../config/api';
import PackageDetails from '../../components/shared/PackageDetails';

const InicioConserje = () => {
  const [loading, setLoading] = useState(true);
  const [paquetesPendientes, setPaquetesPendientes] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState({
    departamento: '',
    tipo: '',
    comentarios: '',
    isUrgente: false
  });
  const [codigoRetiroBusqueda, setCodigoRetiroBusqueda] = useState('');
  const [paqueteVerificacion, setPaqueteVerificacion] = useState(null);
  const [errorVerificacion, setErrorVerificacion] = useState('');
  const [codigoRetiro, setCodigoRetiro] = useState('');
  const [encomiendaEncontrada, setEncomiendaEncontrada] = useState(null);

  useEffect(() => {
    cargarPaquetesPendientes();
  }, []);

  const cargarPaquetesPendientes = async () => {
    try {
      const response = await api.get('/api/encomiendas', { params: { estado: 'pendiente' } });
      setPaquetesPendientes(response.data.data);
    } catch (error) {
      console.error('Error al cargar paquetes pendientes:', error);
      toast.error('Error al cargar los paquetes pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/encomiendas', formData);
      toast.success('Paquete registrado exitosamente');
      setFormData({
        departamento: '',
        tipo: '',
        comentarios: '',
        isUrgente: false
      });
      cargarPaquetesPendientes();
    } catch (error) {
      console.error('Error al registrar paquete:', error);
      toast.error(error.response?.data?.message || 'Error al registrar el paquete');
    }
  };

  const handleEntregarPaquete = async (paqueteId) => {
    try {
      await api.put(`/api/encomiendas/${paqueteId}/retirar`);
      toast.success('Paquete marcado como retirado exitosamente');
      cargarPaquetesPendientes();
    } catch (error) {
      console.error('Error al marcar paquete como retirado:', error);
      toast.error('Error al marcar el paquete como retirado');
    }
  };

  const handleReportarProblema = async (paqueteId) => {
    try {
      await api.post(`/api/encomiendas/${paqueteId}/reportar-problema`);
      toast.success('Problema reportado exitosamente');
      cargarPaquetesPendientes();
    } catch (error) {
      console.error('Error al reportar problema:', error);
      toast.error('Error al reportar el problema');
    }
  };

  const handleVerificarRetiro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorVerificacion('');
    setPaqueteVerificacion(null);

    if (!codigoRetiroBusqueda.trim()) {
      setErrorVerificacion('Por favor, ingresa un código de retiro.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/api/encomiendas/buscar-retiro/${codigoRetiroBusqueda}`);
      if (response.data) {
        // Marcar como retirada inmediatamente
        await api.put(`/api/encomiendas/${response.data._id}/retirar`);
        toast.success('Encomienda marcada como retirada exitosamente');
        setCodigoRetiroBusqueda('');
        setPaqueteVerificacion(null);
        cargarPaquetesPendientes();
      } else {
        setErrorVerificacion('Código de retiro no encontrado.');
      }
    } catch (err) {
      console.error('Error al verificar encomienda:', err);
      setErrorVerificacion(err.response?.data?.message || 'Error al verificar la encomienda. Verifica el código.');
      toast.error(err.response?.data?.message || 'Error en la verificación.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarRetiradoDirecto = async () => {
    if (!paqueteVerificacion || paqueteVerificacion.estado !== 'pendiente') {
      toast.error('No hay un paquete pendiente para marcar como retirado.');
      return;
    }

    setLoading(true);
    setErrorVerificacion('');

    try {
      await api.put(`/api/encomiendas/${paqueteVerificacion._id}/retirar`);
      toast.success('Encomienda marcada como retirada exitosamente.');
      setPaqueteVerificacion(prev => ({ ...prev, estado: 'retirado', fechaRetiro: new Date().toISOString() }));
      setCodigoRetiroBusqueda('');
      cargarPaquetesPendientes();
    } catch (err) {
      console.error('Error al marcar como retirada:', err);
      setErrorVerificacion(err.response?.data?.message || 'Error al marcar la encomienda como retirada.');
      toast.error(err.response?.data?.message || 'Error al marcar retiro.');
    } finally {
      setLoading(false);
    }
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Verificar Retiro de Encomiendas</h2>
        <form onSubmit={handleVerificarRetiro} className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese el código de retiro (ej. RET-ABC123DE)"
            value={codigoRetiroBusqueda}
            onChange={(e) => setCodigoRetiroBusqueda(e.target.value.toUpperCase())}
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Verificar Encomienda'}
          </button>
        </form>
        {errorVerificacion && <p className="text-red-500 mt-2">{errorVerificacion}</p>}

        {paqueteVerificacion && (
          <div className="mt-6 p-4 border border-gray-200 rounded-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Detalles del Paquete</h3>
            <PackageDetails paquete={paqueteVerificacion} />
            <div className="mt-4">
              {paqueteVerificacion.estado === 'pendiente' ? (
                <button
                  onClick={handleMarcarRetiradoDirecto}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Marcando...' : 'Marcar como Retirado'}
                </button>
              ) : (
                <p className="text-green-600 font-bold text-center">Este paquete ya ha sido retirado el {new Date(paqueteVerificacion.fechaRetiro).toLocaleDateString()}.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Registrar Nuevo Paquete</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">
                  Departamento
                </label>
                <input
                  type="text"
                  id="departamento"
                  name="departamento"
                  required
                  value={formData.departamento}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ej: 101, 202, etc."
                />
              </div>

              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                  Tipo de Paquete
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  required
                  value={formData.tipo}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="comida">Comida</option>
                  <option value="supermercado">Supermercado</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700">
                  Comentarios (opcional)
                </label>
                <textarea
                  id="comentarios"
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Información adicional sobre el paquete..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isUrgente"
                  name="isUrgente"
                  checked={formData.isUrgente}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isUrgente" className="ml-2 block text-sm text-gray-900">
                  Marcar como urgente
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Registrar Paquete
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Paquetes Pendientes</h2>
          </div>
          <div className="p-6">
            {paquetesPendientes.length > 0 ? (
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paquetesPendientes.map((paquete) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay paquetes pendientes</p>
            )}
          </div>
        </div>
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
            <PackageDetails paquete={selectedPackage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default InicioConserje; 