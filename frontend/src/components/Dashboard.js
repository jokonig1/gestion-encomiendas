import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = ({ children }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Conserje';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Conserje</h1>
        </div>
        <nav className="mt-4">
          <Link
            to="/dashboard/conserje"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Inicio
          </Link>
          <Link
            to="/dashboard/conserje/nueva-encomienda"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Registrar Paquete
          </Link>
          <Link
            to="/dashboard/conserje/encomiendas-pendientes"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Encomiendas Pendientes
          </Link>
          <Link
            to="/dashboard/conserje/historial"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Historial de Encomiendas
          </Link>
          <Link
            to="/dashboard/conserje/reclamos"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Reclamos
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow">
          <div className="px-4 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Panel de Control</h2>
            <div className="flex items-center">
              <span className="mr-4 text-gray-700">Bienvenido, {userName}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 