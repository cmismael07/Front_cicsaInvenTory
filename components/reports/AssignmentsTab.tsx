import React, { useState, useEffect } from 'react';
import { HistorialAsignacion, Usuario, Equipo } from '../../types';
import { reportService } from '../../services/reportService';
import { Eye } from 'lucide-react';
import { Modal } from '../common/Modal';
import { downloadCSV } from '../../utils/csvExporter';

interface AssignmentsTabProps {
  usuarios: Usuario[];
  equipos: Equipo[];
}

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ usuarios, equipos }) => {
  const [asignaciones, setAsignaciones] = useState<HistorialAsignacion[]>([]);
  const [filters, setFilters] = useState({ user: '', equipment: '' });
  const [grouping, setGrouping] = useState<'NONE' | 'USER' | 'EQUIPMENT'>('NONE');
  const [fileToView, setFileToView] = useState<string | null>(null);

  useEffect(() => {
    reportService.getAssignments().then(setAsignaciones);
  }, []);

  const filteredData = asignaciones.filter(a => {
    return (!filters.user || a.usuario_nombre === filters.user) &&
           (!filters.equipment || a.equipo_codigo === filters.equipment);
  });

  const groupedData = filteredData.reduce((acc, item) => {
    const key = grouping === 'NONE' ? 'Todas' : (grouping === 'USER' ? item.usuario_nombre : item.equipo_codigo);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, HistorialAsignacion[]>);

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="p-4 bg-slate-50 border rounded-lg flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Usuario</label>
                <select className="w-full p-2 border rounded text-sm bg-white" value={filters.user} onChange={e => setFilters({...filters, user: e.target.value})}>
                    <option value="">Todos</option>
                    {usuarios.map(u => <option key={u.id} value={u.nombre_completo}>{u.nombre_completo}</option>)}
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Equipo</label>
                <select className="w-full p-2 border rounded text-sm bg-white" value={filters.equipment} onChange={e => setFilters({...filters, equipment: e.target.value})}>
                    <option value="">Todos</option>
                    {equipos.map(e => <option key={e.id} value={e.codigo_activo}>{e.codigo_activo}</option>)}
                </select>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex border rounded overflow-hidden bg-white">
                <button onClick={() => setGrouping('NONE')} className={`px-3 py-2 text-xs ${grouping === 'NONE' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}>Plano</button>
                <button onClick={() => setGrouping('USER')} className={`px-3 py-2 text-xs ${grouping === 'USER' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}>Usuario</button>
                <button onClick={() => setGrouping('EQUIPMENT')} className={`px-3 py-2 text-xs ${grouping === 'EQUIPMENT' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}>Equipo</button>
            </div>
            <button onClick={() => downloadCSV(filteredData, 'Asignaciones')} className="p-2 text-blue-600 bg-white border rounded hover:bg-blue-50" title="Descargar CSV">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            </button>
        </div>
      </div>

      {/* List */}
      <div className="border rounded-lg overflow-hidden">
        {Object.entries(groupedData).map(([key, items]) => (
            <div key={key}>
                {grouping !== 'NONE' && <div className="bg-slate-100 p-2 font-bold text-sm border-b flex items-center gap-2 px-4 text-slate-700">{key} <span className="text-xs font-normal text-slate-500">({items.length})</span></div>}
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="p-3 text-left">Usuario</th>
                            <th className="p-3 text-left">Equipo</th>
                            <th className="p-3 text-left">Modelo</th>
                            <th className="p-3 text-left">Desde</th>
                            <th className="p-3 text-left">Hasta</th>
                            <th className="p-3 text-center">Docs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className="border-t hover:bg-slate-50">
                                <td className="p-3 font-medium">{item.usuario_nombre}</td>
                                <td className="p-3">{item.equipo_codigo}</td>
                                <td className="p-3 text-slate-500">{item.equipo_modelo}</td>
                                <td className="p-3 text-green-600">{item.fecha_inicio}</td>
                                <td className="p-3">{item.fecha_fin || <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded-full">Vigente</span>}</td>
                                <td className="p-3 text-center">
                                    {item.archivo_pdf ? (
                                        <button onClick={() => setFileToView(item.archivo_pdf!)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Eye className="w-4 h-4"/></button>
                                    ) : <span className="text-slate-300">-</span>}
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-slate-400">Sin registros</td></tr>}
                    </tbody>
                </table>
            </div>
        ))}
      </div>
      
      <Modal isOpen={!!fileToView} onClose={() => setFileToView(null)} title="Vista Previa de Documento">
         <div className="p-8 text-center bg-slate-50 rounded-lg">
             <div className="mb-4 text-slate-400">Simulación de Visor PDF</div>
             <div className="font-mono text-sm bg-white p-2 border rounded inline-block">{fileToView}</div>
         </div>
      </Modal>
    </div>
  );
};
