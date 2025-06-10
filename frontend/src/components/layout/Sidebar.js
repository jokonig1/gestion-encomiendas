import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const conserjeLinks = [
    { path: '/dashboard/conserje', label: 'Inicio', icon: '🏠' },
    { path: '/dashboard/conserje/pendientes', label: 'Paquetes Pendientes', icon: '📦' },
    { path: '/dashboard/conserje/registrar', label: 'Registrar Paquete', icon: '➕' },
    { path: '/dashboard/conserje/historial', label: 'Historial', icon: '📋' },
    { path: '/dashboard/conserje/reclamos', label: 'Reclamos', icon: '🗣️' },
  ];

  const residenteLinks = [
    { path: '/dashboard/residente', label: 'Inicio', icon: '🏠' },
    { path: '/dashboard/residente/activos', label: 'Paquetes Activos', icon: '📦' },
    { path: '/dashboard/residente/historial', label: 'Historial', icon: '📋' },
    { path: '/dashboard/residente/perfil', label: 'Perfil', icon: '👤' },
    { path: '/dashboard/residente/reclamos', label: 'Reclamos', icon: '🗣️' },
  ];

  const links = userRole === 'conserje' ? conserjeLinks : residenteLinks;

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              {userRole === 'conserje' ? 'Panel Conserje' : 'Panel Residente'}
            </h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 