
import React from 'react';
import { X, Save, Zap, CheckCircle, Warehouse, AlertTriangle, Printer, Upload, FileText, UserCheck } from 'lucide-react';
import { Equipo, Departamento } from '../../types';
import { MaintenanceFormData } from '../../hooks/useMaintenanceManager';
import { generateServiceOrder } from '../../utils/documentGenerator';

interface FinalizeMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipo: Equipo | null;
  bodegas: Departamento[];
  formData: MaintenanceFormData;
  reportFile?: File | null;
  onFormChange: (updates: Partial<MaintenanceFormData>) => void;
  onFileChange?: (file: File | null) => void;
  onSubmit: () => void;
}

export const FinalizeMaintenanceModal: React.FC<FinalizeMaintenanceModalProps> = ({
  isOpen, onClose, equipo, bodegas, formData, reportFile, onFormChange, onFileChange, onSubmit
}) => {
  if (!isOpen || !equipo) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handlePrintReport = () => {
      generateServiceOrder(equipo, formData);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          if (onFileChange) onFileChange(e.target.files[0]);
      }
  };

  const isLaptop = () => {
    if (!equipo || !equipo.tipo_nombre) return false;
    const typeName = equipo.tipo_nombre.toLowerCase();
    return typeName.includes('laptop') || typeName.includes('portatil') || typeName.includes('notebook');
  };

  // Determinar si el equipo tenía un usuario asignado antes del mantenimiento
  const hasResponsible = !!equipo.responsable_id;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header Fixed */}
        <div className="flex justify-between items-center p-6 border-b shrink-0 bg-white rounded-t-xl">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Finalizar Mantenimiento</h3>
            <p className="text-sm text-slate-500">Equipo: {equipo.codigo_activo}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
            <form id="finalize-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Mantenimiento</label>
                    <select 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={formData.tipo}
                        onChange={e => onFormChange({ tipo: e.target.value as any })}
                    >
                        <option value="Correctivo">Correctivo</option>
                        <option value="Preventivo">Preventivo</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Costo ($)</label>
                    <input 
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.costo}
                        onChange={e => onFormChange({ costo: Number(e.target.value) })}
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
                    <input 
                    type="text"
                    required
                    placeholder="Ej. Taller Interno, HP Services..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.proveedor}
                    onChange={e => onFormChange({ proveedor: e.target.value })}
                    />
                </div>

                {/* Conditional Charger Field for Laptops */}
                {isLaptop() && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <label className="block text-sm font-medium text-blue-800 mb-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Serie del Cargador
                    </label>
                    <input 
                        type="text"
                        placeholder="Ingrese o verifique la serie del cargador"
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={formData.serie_cargador}
                        onChange={e => onFormChange({ serie_cargador: e.target.value })}
                    />
                    <p className="text-xs text-blue-500 mt-1">Verifique si el cargador fue reemplazado.</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Detalle del Trabajo</label>
                    <textarea 
                    required
                    rows={3}
                    placeholder="Describe qué reparaciones o cambios se realizaron..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.descripcion}
                    onChange={e => onFormChange({ descripcion: e.target.value })}
                    />
                </div>

                {/* Service Order Logic */}
                <div className="border-t pt-4 mt-4">
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Documentación Obligatoria</label>
                    <div className="flex gap-4 items-start">
                        <button 
                            type="button"
                            onClick={handlePrintReport}
                            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-lg text-sm font-medium transition-colors border border-slate-200"
                        >
                            <Printer className="w-4 h-4" /> 1. Imprimir Orden
                        </button>

                        <div className="flex-1">
                            {!reportFile ? (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                                    <div className="flex flex-col items-center justify-center pt-2 pb-2">
                                        <Upload className="w-5 h-5 mb-1 text-slate-400" />
                                        <p className="text-xs text-slate-500"><span className="font-semibold">2. Subir Firmado</span></p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileSelect} />
                                </label>
                            ) : (
                                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <FileText className="w-6 h-6 text-green-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-green-800 truncate">{reportFile.name}</p>
                                        <p className="text-xs text-green-600">Listo para guardar</p>
                                    </div>
                                    <button type="button" onClick={() => onFileChange && onFileChange(null)} className="text-slate-400 hover:text-red-500">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
                    <label className="block text-sm font-semibold text-slate-800 mb-3">Resolución Final</label>
                    <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                        <input 
                        type="radio" 
                        name="accion_final" 
                        value="DISPONIBLE"
                        checked={formData.accion_final === 'DISPONIBLE'}
                        onChange={() => onFormChange({ accion_final: 'DISPONIBLE' })}
                        className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Equipo Operativo
                        </div>
                        <p className="text-xs text-slate-500">
                            El equipo regresará a su estado previo.
                        </p>
                        </div>
                    </label>

                    {/* Lógica de Destino: Si tiene responsable vuelve a él, si no, a bodega */}
                    {formData.accion_final === 'DISPONIBLE' && (
                        <div className="ml-7 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            {hasResponsible ? (
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-blue-800">Retorno a Usuario</p>
                                        <p className="text-xs text-blue-600">
                                            El equipo regresará a estado <strong>ACTIVO</strong> asignado a: <br/>
                                            {equipo.responsable_nombre} ({equipo.ubicacion_nombre})
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                                        <Warehouse className="w-3 h-3" /> Ubicación de Recepción (Bodega IT)
                                    </label>
                                    <select 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        value={formData.ubicacion_id}
                                        onChange={e => onFormChange({ ubicacion_id: e.target.value })}
                                        required
                                    >
                                        {bodegas.length === 0 && <option value="">Sin bodegas definidas</option>}
                                        {bodegas.map(b => (
                                            <option key={b.id} value={b.id}>{b.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-red-400 transition-colors">
                        <input 
                        type="radio" 
                        name="accion_final" 
                        value="BAJA"
                        checked={formData.accion_final === 'BAJA'}
                        onChange={() => onFormChange({ accion_final: 'BAJA' })}
                        className="w-4 h-4 text-red-600"
                        />
                        <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            Equipo Irreparable / Obsoleto
                        </div>
                        <p className="text-xs text-slate-500">Dar de baja definitiva del inventario</p>
                        </div>
                    </label>
                    </div>
                </div>
            </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-slate-50 rounded-b-xl shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">
                Cancelar
            </button>
            <button 
                form="finalize-form" 
                type="submit" 
                disabled={!reportFile}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                title={!reportFile ? 'Debe subir la orden firmada' : ''}
            >
                <Save className="w-4 h-4" /> Finalizar Mantenimiento
            </button>
        </div>
      </div>
    </div>
  );
};
