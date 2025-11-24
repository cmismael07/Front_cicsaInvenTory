import React, { useState, useEffect } from 'react';
import { ReporteGarantia } from '../../types';
import { reportService } from '../../services/reportService';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const WarrantiesTab: React.FC = () => {
  const [garantias, setGarantias] = useState<ReporteGarantia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getWarranties().then((data) => {
        setGarantias(data.sort((a,b) => a.dias_restantes - b.dias_restantes));
        setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-4">
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
                <h4 className="font-bold text-orange-800">Equipos próximos a vencer garantía</h4>
                <p className="text-sm text-orange-700">Este reporte muestra los equipos activos cuya garantía expira en los próximos 90 días.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <p className="text-slate-500 p-4">Cargando reporte...</p> : garantias.map((g, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${g.dias_restantes < 30 ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                    <div className="flex justify-between items-start mb-2 pl-2">
                        <div>
                            <p className="font-bold text-slate-800">{g.equipo.codigo_activo}</p>
                            <p className="text-xs text-slate-500">{g.equipo.marca} {g.equipo.modelo}</p>
                        </div>
                        <ShieldCheck className={`w-5 h-5 ${g.dias_restantes < 30 ? 'text-red-500' : 'text-amber-500'}`} />
                    </div>
                    
                    <div className="pl-2 space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Vencimiento:</span>
                            <span className="font-medium text-slate-700">{g.fecha_vencimiento}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Días Restantes:</span>
                            <span className={`font-bold ${g.dias_restantes < 30 ? 'text-red-600' : 'text-amber-600'}`}>
                                {g.dias_restantes} días
                            </span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Responsable:</span>
                            <span className="text-slate-700 truncate max-w-[120px]" title={g.equipo.responsable_nombre}>{g.equipo.responsable_nombre || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            ))}
            {!loading && garantias.length === 0 && (
                <div className="col-span-full p-8 text-center text-slate-500">No hay garantías próximas a vencer.</div>
            )}
        </div>
    </div>
  );
};
