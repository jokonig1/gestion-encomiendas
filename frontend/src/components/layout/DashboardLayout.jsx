import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const DashboardLayout = ({ children, userRole }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Barra superior */}
            <TopBar 
                title="Panel de Control" 
                onMenuClick={() => setIsSidebarOpen(true)} 
            />

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                userRole={userRole}
            />

            {/* Contenido principal */}
            <main className="lg:ml-64 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout; 