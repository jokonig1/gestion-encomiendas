import React from 'react';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ userName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí iría la lógica de logout
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-lg font-medium text-gray-900">
              Bienvenido/a, {userName}
            </h1>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar; 