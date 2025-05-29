import React from 'react';

const TopBar = ({ title, onMenuClick }) => {
    return (
        <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 bg-white shadow-sm">
            <div className="flex items-center justify-between h-16 px-4">
                {/* Botón hamburguesa para móvil */}
                <button
                    onClick={onMenuClick}
                    className="block lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    aria-label="Abrir menú"
                >
                    <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Título */}
                <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

                {/* Espacio para elementos adicionales */}
                <div className="w-10" />
            </div>
        </header>
    );
};

export default TopBar; 