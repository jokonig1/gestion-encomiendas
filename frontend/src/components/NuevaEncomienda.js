import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Configurar la URL base de axios
axios.defaults.baseURL = 'http://localhost:5000';

const NuevaEncomienda = () => {
  const [formData, setFormData] = useState({
    departamento: '',
    tipo: '',
    comentarios: '',
    isUrgente: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.departamento) {
      newErrors.departamento = 'El número de departamento es requerido';
    } else if (!/^\d+$/.test(formData.departamento)) {
      newErrors.departamento = 'El número de departamento debe contener solo dígitos';
    }
    
    if (!formData.tipo) {
      newErrors.tipo = 'El tipo de paquete es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar cambio en el checkbox de urgente
  const handleUrgenteChange = (e) => {
    setFormData(prev => ({
      ...prev,
      isUrgente: e.target.checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Para debugging
      console.log('Enviando datos:', formData); // Para debugging
      
      const response = await axios.post('/api/encomiendas', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Respuesta:', response.data); // Para debugging
      
      if (response.data.success) {
        toast.success('Encomienda registrada exitosamente');
        // Limpiar el formulario
        setFormData({
          departamento: '',
          tipo: '',
          comentarios: '',
          isUrgente: false,
        });
        // Limpiar errores
        setErrors({});
      }
    } catch (err) {
      console.error('Error completo:', err); // Para debugging
      const errorMessage = err.response?.data?.message || 'Error al registrar la encomienda';
      toast.error(errorMessage);
      
      // Si hay errores de validación del servidor, mostrarlos en el formulario
      if (err.response?.data?.error) {
        setErrors(prev => ({
          ...prev,
          ...err.response.data.error
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Registrar Nueva Encomienda</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Número de Departamento *
          </label>
          <input
            type="text"
            name="departamento"
            value={formData.departamento}
            onChange={handleChange}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.departamento ? 'border-red-500' : ''
            }`}
            placeholder="Ej: 101"
          />
          {errors.departamento && (
            <p className="text-red-500 text-xs italic mt-1">{errors.departamento}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Tipo de Paquete *
          </label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.tipo ? 'border-red-500' : ''
            }`}
          >
            <option value="">Seleccione un tipo</option>
            <option value="comida">Comida</option>
            <option value="supermercado">Supermercado</option>
            <option value="general">General</option>
          </select>
          {errors.tipo && (
            <p className="text-red-500 text-xs italic mt-1">{errors.tipo}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Comentarios
          </label>
          <textarea
            name="comentarios"
            value={formData.comentarios}
            onChange={handleChange}
            placeholder="Información adicional sobre la encomienda"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
          />
        </div>

        {/* Checkbox para marcar como urgente */}
        <div className="flex items-center">
          <input
            id="isUrgente"
            name="isUrgente"
            type="checkbox"
            checked={formData.isUrgente}
            onChange={handleUrgenteChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isUrgente" className="ml-2 block text-sm text-gray-900">
            Marcar como urgente
          </label>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : (
              'Registrar Encomienda'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevaEncomienda; 