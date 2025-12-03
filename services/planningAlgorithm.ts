

import { Equipo, DetallePlan, EstadoPlan, TipoEquipo } from '../types';

/**
 * Generates a distributed maintenance plan.
 * @param year The target year for the plan
 * @param equipos List of equipment to schedule
 * @param tipos List of equipment types to determine frequency
 * @param planId ID of the plan being created
 */
export const generateAnnualPlan = (
  year: number,
  equipos: Equipo[],
  tipos: TipoEquipo[],
  planId: number
): DetallePlan[] => {
  const schedule: DetallePlan[] = [];
  let detailIdCounter = 1;

  // Helper to check load per month to balance annual maintenance
  const getMonthLoad = (month: number) => schedule.filter(s => s.mes_programado === month).length;

  equipos.forEach(eq => {
    // 1. Determine Frequency based on Equipment Type
    const type = tipos.find(t => t.id === eq.tipo_equipo_id);
    const freqAnual = type?.frecuencia_anual ?? 1;

    // 2. If freq is 0, exclude from plan
    if (freqAnual === 0) return;

    let monthsToSchedule: number[] = [];

    // 3. Logic based on Annual Frequency (Quantity)
    if (freqAnual >= 12) {
      // Monthly
      monthsToSchedule = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    } else if (freqAnual === 1) {
      // Annual - Balance load
      let minLoad = Infinity;
      let selectedMonth = 1;
      // Simple heuristic: Try to find a month with fewer tasks
      for (let m = 1; m <= 12; m++) {
        const load = getMonthLoad(m);
        if (load < minLoad) {
          minLoad = load;
          selectedMonth = m;
        }
      }
      monthsToSchedule = [selectedMonth];
    } else {
      // Multiple times a year (2, 3, 4, 6)
      // Calculate interval
      const interval = Math.floor(12 / freqAnual);
      
      // Determine best starting offset to balance load
      let bestOffset = 0;
      let minTotalLoad = Infinity;

      for (let offset = 0; offset < interval; offset++) {
        // Generate candidate months for this offset
        const candidateMonths: number[] = [];
        for (let k = 0; k < freqAnual; k++) {
          candidateMonths.push(offset + 1 + (k * interval));
        }

        // Calculate load for this set of months
        const currentLoad = candidateMonths.reduce((sum, m) => sum + getMonthLoad(m), 0);
        
        if (currentLoad < minTotalLoad) {
          minTotalLoad = currentLoad;
          bestOffset = offset;
        }
      }

      // Generate final months based on best offset
      for (let k = 0; k < freqAnual; k++) {
        monthsToSchedule.push(bestOffset + 1 + (k * interval));
      }
    }

    // 4. Create Schedule Items
    monthsToSchedule.forEach(month => {
      // Ensure month is within 1-12 range just in case
      if (month > 12) month = 12; 

      schedule.push({
        id: Date.now() + detailIdCounter++, // Temp ID generation
        plan_id: planId,
        equipo_id: eq.id,
        equipo_codigo: eq.codigo_activo,
        equipo_tipo: eq.tipo_nombre || 'Equipo',
        equipo_modelo: `${eq.marca} ${eq.modelo}`,
        equipo_ubicacion: eq.ubicacion_nombre || 'Sin Ubicación',
        mes_programado: month,
        estado: EstadoPlan.PENDIENTE
      });
    });
  });

  return schedule;
};
