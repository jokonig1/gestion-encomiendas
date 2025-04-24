import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ActivePackages from './ActivePackages';
import PackageHistory from './PackageHistory';
import Profile from './Profile';

const ClientDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('active');

  // Determinar la sección activa basada en la URL actual
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/history')) {
      setActiveSection('history');
    } else if (path.includes('/profile')) {
      setActiveSection('profile');
    } else {
      setActiveSection('active');
    }
  }, [location]);

  const menuItems = [
    { id: 'active', label: 'Paquetes Activos', path: '/dashboard/cliente/active' },
    { id: 'history', label: 'Historial', path: '/dashboard/cliente/history' },
    { id: 'profile', label: 'Perfil', path: '/dashboard/cliente/profile' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'active':
        return <ActivePackages />;
      case 'history':
        return <PackageHistory />;
      case 'profile':
        return <Profile />;
      default:
        return <ActivePackages />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Cliente</h2>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer ${
                activeSection === item.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => {
                setActiveSection(item.id);
                handleNavigation(item.path);
              }}
            >
              <span className="mx-3">{item.label}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard; 