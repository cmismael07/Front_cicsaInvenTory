
import React, { useState } from 'react';
import { PlanningConfig } from './maintenance/PlanningConfig';
import { PlanningCalendar } from './maintenance/PlanningCalendar';
import { PlanMantenimiento, DetallePlan, Equipo } from '../types';
import { maintenancePlanningService } from '../services/maintenancePlanningService';
import Swal from 'sweetalert2';

const MaintenancePlanning: React.FC = () => {
  const [view, setView] = useState<'CONFIG' | 'CALENDAR'>('CONFIG');
  const [currentPlan, setCurrentPlan] = useState<PlanMantenimiento | null>(null);
  const [planDetails, setPlanDetails] = useState<DetallePlan[]>([]);
  const [isNewPlan, setIsNewPlan] = useState(false);

  const handleGeneratePlan = async (year: number, equipos: Equipo[]) => {
    try {
        const generated = await maintenancePlanningService.generatePlan(year, equipos);
        setCurrentPlan(generated.header);
        setPlanDetails(generated.details);
        setIsNewPlan(true);
        setView('CALENDAR');
    } catch (e: any) {
        Swal.fire('Error', e.message, 'error');
    }
  };

  const handleViewPlan = async (planId: number) => {
      try {
          const { plan, details } = await maintenancePlanningService.getPlanDetails(planId);
          setCurrentPlan(plan);
          setPlanDetails(details);
          setIsNewPlan(false);
          setView('CALENDAR');
      } catch (e: any) {
          Swal.fire('Error', 'No se pudo cargar el plan', 'error');
      }
  };

  const handleSavePlan = async (details: DetallePlan[]) => {
      if (!currentPlan) return;
      try {
          await maintenancePlanningService.savePlan(currentPlan, details);
          Swal.fire('Éxito', 'Plan guardado correctamente', 'success');
          setView('CONFIG'); // Go back to list
      } catch (e: any) {
          Swal.fire('Error', 'Error al guardar el plan', 'error');
      }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
       {view === 'CONFIG' && (
           <div className="flex-1 overflow-auto">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Planificación de Mantenimiento</h2>
                <PlanningConfig 
                    onGenerate={handleGeneratePlan}
                    onViewPlan={handleViewPlan}
                />
           </div>
       )}

       {view === 'CALENDAR' && currentPlan && (
           <PlanningCalendar 
              plan={currentPlan}
              initialDetails={planDetails}
              isNew={isNewPlan}
              onSave={handleSavePlan}
              onBack={() => setView('CONFIG')}
           />
       )}
    </div>
  );
};

export default MaintenancePlanning;
