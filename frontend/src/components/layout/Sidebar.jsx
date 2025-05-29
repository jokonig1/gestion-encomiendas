import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, userRole }) => {
    const menuItems = userRole === 'conserje' ? [
        { path: '/dashboard/conserje', label: 'Inicio', icon: '📊' },
        { path: '/dashboard/conserje/registrar', label: 'Registrar Paquete', icon: '📦' },
        { path: '/dashboard/conserje/pendientes', label: 'Paquetes Pendientes', icon: '⏳' },
        { path: '/dashboard/conserje/historial', label: 'Historial', icon: '📝' },
        { path: '/dashboard/conserje/reclamos', label: 'Reclamos', icon: '⚠️' }
    ] : [
        { path: '/dashboard/residente', label: 'Inicio', icon: '📊' },
        { path: '/dashboard/residente/paquetes', label: 'Mis Paquetes', icon: '📦' },
        { path: '/dashboard/residente/historial', label: 'Historial', icon: '📝' },
        { path: '/dashboard/residente/perfil', label: 'Mi Perfil', icon: '👤' }
    ];

    return (
        <>
            {/* Overlay para móvil */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`
                    fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo y botón cerrar (solo móvil) */}
                    <div className="p-4 border-b flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-800">Encomiendas</h1>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            aria-label="Cerrar menú"
                        >
                            <svg
                                className="h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Menú */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center px-4 py-2 rounded-lg transition-colors duration-200
                                    ${isActive
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }
                                `}
                                onClick={() => onClose()}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t">
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('userRole');
                                window.location.href = '/login';
                            }}
                            className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                            <span className="mr-3">🚪</span>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar; 