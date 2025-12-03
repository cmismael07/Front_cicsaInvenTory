

import { api } from './mockApi';
import { generateAnnualPlan } from './planningAlgorithm';
import { PlanMantenimiento, DetallePlan, Equipo, EvidenciaMantenimiento } from '../types';

export const maintenancePlanningService = {
  
  // Get all Plans
  getPlans: async () => {
    return api.getMaintenancePlans();
  },

  // Get specific plan details
  getPlanDetails: async (planId: number) => {
    return api.getPlanDetails(planId);
  },

  // Generate a new plan (In memory, then save)
  generatePlan: async (year: number, equipos: Equipo[], cityId: number, cityName: string) => {
    // 1. Fetch Types to determine frequency
    const tipos = await api.getTiposEquipo();

    // 2. Create Plan Header
    const newPlanId = Date.now(); // Mock ID
    const planHeader: PlanMantenimiento = {
      id: newPlanId,
      anio: year,
      nombre: `Plan Maestro ${year} - ${cityName}`,
      creado_por: 'Admin', // In real app, get current user
      fecha_creacion: new Date().toISOString().split('T')[0],
      estado: 'ACTIVO',
      ciudad_id: cityId,
      ciudad_nombre: cityName
    };

    // 3. Run Algorithm with types
    const details = generateAnnualPlan(year, equipos, tipos, newPlanId);

    return { header: planHeader, details };
  },

  // Save the generated plan to DB
  savePlan: async (plan: PlanMantenimiento, details: DetallePlan[]) => {
    return api.createMaintenancePlan(plan, details);
  },

  // Update a schedule item (e.g. move month)
  updateScheduleItem: async (itemId: number, newMonth: number) => {
    return api.updatePlanDetailMonth(itemId, newMonth);
  },

  // Register execution (status + evidence)
  registerExecution: async (
    detailId: number, 
    data: { 
      fecha: string; 
      tecnico: string; 
      observaciones: string; 
      archivo?: File 
    }
  ) => {
    return api.registerMaintenanceExecution(detailId, data);
  },

  // Get evidence for a task
  getEvidence: async (detailId: number) => {
    return api.getEvidence(detailId);
  },

  // Send equipment to maintenance workflow
  sendToMaintenance: async (detailId: number, motivo: string) => {
    return api.iniciarMantenimientoDesdePlan(detailId, motivo);
  }
};