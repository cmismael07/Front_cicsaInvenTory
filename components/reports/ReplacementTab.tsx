
import React, { useState, useEffect } from 'react';
import { Equipo } from '../../types';
import { reportService } from '../../services/reportService';
import { formatCurrency, calculateAge } from '../../utils/formatters';
import { AlertOctagon, Download, TrendingUp } from 'lucide-react';
import { downloadCSV } from '../../utils/csvExporter';

export const ReplacementTab: React.FC = () => {
  const [candidates, setCandidates] = useState<Equipo[]>([]);
  const [totalEquiposCount, setTotalEquiposCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        try {
            const [candidatesData, allEquipos] = await Promise.all([
                reportService.getReplacementCandidates(),
                reportService.getEquipos()
            ]);
            setCandidates(candidatesData);
            setTotalEquiposCount(allEquipos.length);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, []);

  const totalCost = candidates.reduce((acc, curr) => acc + curr.valor_compra, 0);
  const percentage = totalEquiposCount > 0 ? ((candidates.length / totalEquiposCount) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
       {/* Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
             <div className="flex items-center gap-2 mb-1">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-800">Equipos Obsoletos (&gt; 4 años)</span>
             </div>
             <p className="text-3xl font-bold text-red-700">{candidates.length}</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
             <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-800">% de Obsolescencia</span>
             </div>
             <p className="text-3xl font-bold text-orange-700">{percentage}%</p>
             <p className="text-xs text-orange-600 mt-1">Del inventario total ({totalEquiposCount} equipos)</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
             <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-blue-800">Costo Estimado Reposición</span>
             </div>
             <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalCost)}</p>
             <p className="text-xs text-blue-600 mt-1">Basado en valor de compra histórico</p>
          </div>
       </div>

       <div className="flex justify-end">
          <button 
             onClick={() => downloadCSV(candidates, 'Plan_Renovacion_Tecnologica')}
             className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 transition-colors"
          >
             <Download className="w-4 h-4" /> Exportar Listado
          </button>
       </div>

       {/* Table */}
       <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Equipo</th>
                   <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                   <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Fecha Compra</th>
                   <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Antigüedad</th>
                   <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado Actual</th>
                   <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Usuario</th>
                </tr>
             </thead>
             <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">Calculando reporte...</td></tr>
                ) : candidates.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50">
                       <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800">{e.codigo_activo}</div>
                          <div className="text-xs text-slate-500">{e.marca} {e.modelo}</div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{e.tipo_nombre}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{e.fecha_compra}</td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                             {calculateAge(e.fecha_compra)} años
                          </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{e.estado}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{e.responsable_nombre || 'N/A'}</td>
                    </tr>
                ))}
                {!loading && candidates.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">Excelente! No hay equipos con antigüedad crítica (&gt; 4 años).</td></tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
};
