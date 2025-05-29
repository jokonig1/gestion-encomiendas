// Configuración de la API
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configuración de roles
export const ROLES = {
    CONSERJE: 'conserje',
    RESIDENTE: 'residente'
};

// Configuración de estados de paquetes
export const ESTADOS_PAQUETE = {
    PENDIENTE: 'pendiente',
    ENTREGADO: 'entregado'
};

// Configuración de estados de reclamos
export const ESTADOS_RECLAMO = {
    PENDIENTE: 'pendiente',
    EN_PROCESO: 'en_proceso',
    RESUELTO: 'resuelto'
};

// Configuración de tipos de reclamos
export const TIPOS_RECLAMO = {
    DANO: 'daño',
    PERDIDA: 'perdida',
    RETRASO: 'retraso',
    OTRO: 'otro'
}; 