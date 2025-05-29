import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Dashboard = () => {
    return (
        <DashboardLayout userRole="residente">
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard del Residente</h2>
                {/* Contenido del dashboard */}
            </div>
        </DashboardLayout>
    );
};

export default Dashboard; 