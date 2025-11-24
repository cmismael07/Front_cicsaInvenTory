
import { api } from './mockApi';
import { Equipo, Usuario } from '../types';

export const reportService = {
  getAssignments: async () => api.getHistorialAsignaciones(),
  
  getMovements: async (tipoId?: number) => api.getHistorial(tipoId),
  
  getMaintenance: async (tipoId?: number) => api.getHistorialMantenimiento(tipoId),
  
  getWarranties: async () => api.getWarrantyReport(),
  
  getReplacementCandidates: async () => api.getReplacementCandidates(),
  
  // Licenses
  getLicenses: async () => api.getLicencias(),
  getLicenseTypes: async () => api.getTipoLicencias(),
  
  // Helpers para filtros
  getEquipmentTypes: async () => api.getTiposEquipo(),
  getUsers: async () => api.getUsuarios(),
  getEquipos: async () => api.getEquipos(),
};
