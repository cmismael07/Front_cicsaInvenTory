
import React, { useState, useEffect } from 'react';
import { DetallePlan, EstadoPlan, PlanMantenimiento } from '../../types';
import { ChevronLeft, Save, GripVertical, CheckCircle, Clock, AlertCircle, Wrench } from 'lucide-react';
import { MaintenanceExecutionModal } from './MaintenanceExecutionModal';
import { maintenancePlanningService } from '../../services/maintenancePlanningService';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

interface PlanningCalendarProps {
  plan: PlanMantenimiento;
  initialDetails: DetallePlan[];
  isNew: boolean;
  onSave?: (details: DetallePlan[]) => Promise<void>;
  onBack: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const PlanningCalendar: React.FC<PlanningCalendarProps> = ({ plan, initialDetails, isNew, onSave, onBack }) => {
  const [schedule, setSchedule] = useState<Record<number, DetallePlan[]>>({});
  const [draggedItem, setDraggedItem] = useState<DetallePlan | null>(null);
  const navigate = useNavigate();
  
  // Execution Modal
  const [executionTask, setExecutionTask] = useState<DetallePlan | null>(null);

  useEffect(() => {
    // Group details by month
    const grouped: Record<number, DetallePlan[]> = {};
    MONTH_NAMES.forEach((_, idx) => grouped[idx + 1] = []);
    
    initialDetails.forEach(d => {
      if (!grouped[d.mes_programado]) grouped[d.mes_programado] = [];
      grouped[d.mes_programado].push(d);
    });
    
    setSchedule(grouped);
  }, [initialDetails]);

  // --- Drag & Drop Logic ---

  const handleDragStart = (e: React.DragEvent, item: DetallePlan) => {
    // Only allow drag if plan is draft or user wants to reschedule pending items?
    // Let's allow simple planning drag.
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, monthIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetMonth: number) => {
    e.preventDefault();
    if (!draggedItem) return;
    if (draggedItem.mes_programado === targetMonth) return;

    // Update Local State
    const sourceMonth = draggedItem.mes_programado;
    
    // Remove from source
    const newSourceList = schedule[sourceMonth].filter(i => i.id !== draggedItem.id);
    
    // Add to target
    const newItem = { ...draggedItem, mes_programado: targetMonth };
    const newTargetList = [...schedule[targetMonth], newItem];

    setSchedule(prev => ({
      ...prev,
      [sourceMonth]: newSourceList,
      [targetMonth]: newTargetList
    }));

    setDraggedItem(null);

    // If not new plan, update backend immediately (rescheduling)
    if (!isNew) {
      try {
        await maintenancePlanningService.updateScheduleItem(draggedItem.id, targetMonth);
      } catch (error) {
        console.error("Failed to update schedule", error);
        // Revert (omitted for brevity, would need comprehensive state management)
      }
    }
  };

  // --- Actions ---

  const handleSavePlan = async () => {
    if (onSave) {
      // Flatten schedule back to array
      const flatDetails = Object.values(schedule).flat();
      await onSave(flatDetails);
    }
  };

  const handleTaskClick = async (task: DetallePlan) => {
    if (isNew) return; // Editing draft, no action
    
    if (task.estado === EstadoPlan.REALIZADO) {
        Swal.fire('Mantenimiento Realizado', 'Esta tarea ya ha sido completada.', 'success');
        return;
    }
    
    if (task.estado === EstadoPlan.EN_PROCESO) {
         Swal.fire('En Proceso', 'Este equipo ya se encuentra en el taller.', 'info');
         return;
    }

    const result = await Swal.fire({
        title: 'Iniciar Mantenimiento',
        text: `¿Desea enviar el equipo ${task.equipo_codigo} a mantenimiento? Se marcará como "En Proceso".`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, enviar a taller',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await maintenancePlanningService.sendToMaintenance(task.id, "Mantenimiento Programado");
            
            // Update local state to show 'EN_PROCESO'
            setSchedule(prev => {
                const monthList = prev[task.mes_programado];
                const updatedList = monthList.map(t => 
                    t.id === task.id ? { ...t, estado: EstadoPlan.EN_PROCESO } : t
                );
                return { ...prev, [task.mes_programado]: updatedList };
            });

            const navResult = await Swal.fire({
                title: 'Enviado',
                text: 'El equipo ha sido enviado a la cola de mantenimiento. ¿Desea ir a la gestión de mantenimientos ahora?',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Ir a Mantenimientos',
                cancelButtonText: 'Permanecer aquí'
            });

            if (navResult.isConfirmed) {
                navigate('/mantenimiento');
            }

        } catch (e: any) {
            Swal.fire('Error', e.message, 'error');
        }
    }
  };

  const refreshTask = async () => {
    // In a real app, fetch just the task or whole plan.
    // Here we'll just toggle state locally for the mock
    if (executionTask) {
       setSchedule(prev => {
         const monthList = prev[executionTask.mes_programado];
         const updatedList = monthList.map(t => 
             t.id === executionTask.id ? { ...t, estado: EstadoPlan.REALIZADO } : t
         );
         return { ...prev, [executionTask.mes_programado]: updatedList };
       });
    }
  };

  // --- Render Helpers ---

  const getStatusIcon = (status: EstadoPlan) => {
      switch(status) {
          case EstadoPlan.REALIZADO: return <CheckCircle className="w-4 h-4 text-green-600" />;
          case EstadoPlan.EN_PROCESO: return <Wrench className="w-4 h-4 text-amber-500 animate-pulse" />;
          case EstadoPlan.PENDIENTE: return <Clock className="w-4 h-4 text-slate-400" />;
          case EstadoPlan.RETRASADO: return <AlertCircle className="w-4 h-4 text-red-500" />;
          default: return null;
      }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
             <h2 className="text-xl font-bold text-slate-800">{plan.nombre}</h2>
             <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{isNew ? 'Borrador' : plan.estado}</span>
          </div>
        </div>
        
        {isNew && (
            <button 
                onClick={handleSavePlan}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
                <Save className="w-4 h-4" /> Guardar Plan
            </button>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-slate-50 rounded-xl overflow-x-auto border border-slate-200 custom-scrollbar">
         <div className="min-w-[1200px] h-full grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 divide-x divide-slate-200">
            {MONTH_NAMES.map((monthName, idx) => {
                const monthIndex = idx + 1;
                const items = schedule[monthIndex] || [];
                
                return (
                    <div 
                        key={monthIndex} 
                        className="flex flex-col h-full min-h-[500px] bg-white"
                        onDragOver={(e) => handleDragOver(e, monthIndex)}
                        onDrop={(e) => handleDrop(e, monthIndex)}
                    >
                        <div className="p-3 bg-slate-50 border-b border-slate-100 text-center font-bold text-slate-700 text-sm uppercase sticky top-0 z-10">
                            {monthName} <span className="text-xs text-slate-400 font-normal ml-1">({items.length})</span>
                        </div>
                        <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
                            {items.map(task => (
                                <div 
                                    key={task.id}
                                    draggable={task.estado === EstadoPlan.PENDIENTE}
                                    onDragStart={(e) => handleDragStart(e, task)}
                                    onClick={() => handleTaskClick(task)}
                                    className={`
                                        p-2 rounded border text-xs shadow-sm cursor-pointer hover:shadow-md transition-all relative group
                                        ${task.estado === EstadoPlan.REALIZADO ? 'bg-green-50 border-green-200 opacity-75' : ''}
                                        ${task.estado === EstadoPlan.EN_PROCESO ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-300' : ''}
                                        ${task.estado === EstadoPlan.PENDIENTE ? 'bg-white border-slate-200 hover:border-blue-300' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-slate-700">{task.equipo_codigo}</span>
                                        {getStatusIcon(task.estado)}
                                    </div>
                                    <p className="text-slate-600 truncate mb-1">{task.equipo_modelo}</p>
                                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                        {task.equipo_ubicacion}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
         </div>
      </div>

      <MaintenanceExecutionModal 
        isOpen={!!executionTask}
        onClose={() => setExecutionTask(null)}
        task={executionTask}
        onSuccess={refreshTask}
      />
    </div>
  );
};
