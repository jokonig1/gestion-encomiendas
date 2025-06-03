import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ActivePackages from './ActivePackages';
import PackageHistory from './PackageHistory';
import Profile from './Profile';
import ClaimsHistoryClient from './ClaimsHistoryClient';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ClientDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('active');
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = localStorage.getItem('userId');
  const userName = user?.nombre || 'Cliente';

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/history')) {
      setActiveSection('history');
    } else if (path.includes('/profile')) {
      setActiveSection('profile');
    } else if (path.includes('/claims')) {
      setActiveSection('claims');
    } else {
      setActiveSection('active');
    }
  }, [location]);

  useEffect(() => {
    const checkAndNotifyPackages = async () => {
      if (!userId) {
        console.error('UserId no encontrado en localStorage.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage.');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      try {
        const unnotifiedRes = await axios.get(`${API_URL}/api/encomiendas/usuario/${userId}/notificaciones/nuevas`, config);
        const unnotifiedPackages = unnotifiedRes.data.data;

        console.log('Encomiendas no notificadas encontradas:', unnotifiedPackages);

        if (unnotifiedPackages.length > 0) {
          toast.info(`Tienes ${unnotifiedPackages.length} nueva(s) encomienda(s) registrada(s).`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });

          const packageIdsToMark = unnotifiedPackages.map(pkg => pkg._id);
          await axios.patch(`${API_URL}/api/encomiendas/notificaciones/marcar-leido`, { ids: packageIdsToMark }, config);
          console.log(`${packageIdsToMark.length} encomienda(s) marcadas como notificadas.`);
        }

        const hasShownUrgentNotification = sessionStorage.getItem('hasShownUrgentNotification');
        
        if (!hasShownUrgentNotification) {
          const urgentRes = await axios.get(`${API_URL}/api/encomiendas/usuario/${userId}/notificaciones/urgentes`, config);
          const urgentPackages = urgentRes.data.data;

          console.log('Encomiendas urgentes pendientes encontradas:', urgentPackages);

          if (urgentPackages.length > 0) {
            const urgentMessage = urgentPackages.length === 1 
              ? `Tienes 1 paquete URGENTE pendiente por retirar (código: ${urgentPackages[0].codigo}).`
              : `Tienes ${urgentPackages.length} paquetes URGENTES pendientes por retirar.`;
            
            toast.warning(urgentMessage, {
              position: "top-center",
              autoClose: false,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            sessionStorage.setItem('hasShownUrgentNotification', 'true');
          }
        }

      } catch (error) {
        console.error('Error al verificar notificaciones:', error);
      }
    };

    const handleBeforeUnload = () => {
      sessionStorage.removeItem('hasShownUrgentNotification');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    checkAndNotifyPackages();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };

  }, [userId]);

  const menuItems = [
    { id: 'active', label: 'Paquetes Activos', path: '/dashboard/cliente/active' },
    { id: 'history', label: 'Historial de Encomiendas', path: '/dashboard/cliente/history' },
    { id: 'claims', label: 'Historial de Reclamos', path: '/dashboard/cliente/claims' },
    { id: 'profile', label: 'Perfil', path: '/dashboard/cliente/profile' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'active':
        return <ActivePackages />;
      case 'history':
        return <PackageHistory />;
      case 'claims':
        return <ClaimsHistoryClient />;
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
        {/* Top Bar */}
        <header className="bg-white shadow">
          <div className="px-4 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Panel de Cliente</h2>
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
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard; 