
import React, { useState, useEffect } from 'react';
import { Play, List, CalendarRange, Eye } from 'lucide-react';
import { PlanMantenimiento, Equipo } from '../../types';
import { maintenancePlanningService } from '../../services/maintenancePlanningService';
import { api } from '../../services/mockApi';

interface PlanningConfigProps {
  onGenerate: (year: number, equipos: Equipo[]) => void;
  onViewPlan: (planId: number) => void;
}

export const PlanningConfig: React.FC<PlanningConfigProps> = ({ onGenerate, onViewPlan }) => {
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  const [history, setHistory] = useState<PlanMantenimiento[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const plans = await maintenancePlanningService.getPlans();
      setHistory(plans);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerate = async () => {
    // 1. Get all active equipment
    const allEquipos = await api.getEquipos();
    // Filter out retired equipment
    const activeEquipos = allEquipos.filter(e => e.estado !== 'Baja' && e.estado !== 'Para Baja');
    
    onGenerate(year, activeEquipos);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* --- Generar Nuevo Plan --- */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
                <CalendarRange className="w-8 h-8 text-blue-600" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Generador de Plan Anual</h2>
                <p className="text-slate-500 mt-1">
                    El sistema analizará la frecuencia de mantenimiento de cada equipo y su ubicación 
                    para distribuir la carga de trabajo automáticamente a lo largo de los 12 meses.
                </p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end bg-slate-50 p-6 rounded-lg border border-slate-100">
            <div className="w-full sm:w-48">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Año del Plan</label>
                <input 
                    type="number" 
                    min={2024} 
                    max={2030}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-center text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                />
            </div>
            <button 
                onClick={handleGenerate}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
            >
                <Play className="w-5 h-5 fill-current" /> Generar Propuesta
            </button>
        </div>
      </div>

      {/* --- Historial --- */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
         <div className="flex items-center gap-3 mb-6">
            <List className="w-6 h-6 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800">Historial de Planes</h3>
         </div>
         
         {loadingHistory ? (
            <div className="text-center py-8 text-slate-400">Cargando historial...</div>
         ) : history.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No hay planes registrados.
            </div>
         ) : (
            <div className="overflow-hidden border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Año</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Creado Por</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {history.map(plan => (
                            <tr key={plan.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">{plan.nombre}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-600">{plan.anio}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${plan.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {plan.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{plan.creado_por}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button 
                                        onClick={() => onViewPlan(plan.id)}
                                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Ver Plan"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         )}
      </div>

    </div>
  );
};
