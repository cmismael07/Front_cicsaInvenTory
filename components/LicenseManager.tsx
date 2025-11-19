
import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { TipoLicencia, Licencia, Usuario } from '../types';
import { Key, Users, Plus, Trash2, Edit, Save, X, UserCheck, Shield, RefreshCw } from 'lucide-react';
import EntityManager from './EntityManager';

const LicenseManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'ASSIGNMENTS'>('CATALOG');
  const [tipos, setTipos] = useState<TipoLicencia[]>([]);
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Stock Modal
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockForm, setStockForm] = useState({ tipoId: 0, cantidad: 1, fechaVencimiento: '' });

  // Assign Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<Licencia | null>(null);
  const [assignUserId, setAssignUserId] = useState<number | string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [t, l, u] = await Promise.all([
      api.getTipoLicencias(),
      api.getLicencias(),
      api.getUsuarios()
    ]);
    setTipos(t);
    setLicencias(l);
    setUsuarios(u.filter(user => user.activo)); // Only active users can receive licenses
    setLoading(false);
  };

  // -- Logic for Catalog Tab --
  
  const handleAddStock = (tipoId: number) => {
    setStockForm({ 
        tipoId, 
        cantidad: 1, 
        fechaVencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] 
    });
    setIsStockModalOpen(true);
  };

  const submitStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.agregarStockLicencias(stockForm.tipoId, stockForm.cantidad, stockForm.fechaVencimiento);
        setIsStockModalOpen(false);
        loadData();
        alert('Stock agregado correctamente');
    } catch (error: any) {
        alert(error.message);
    }
  };

  // -- Logic for Assignment Tab --

  const handleAssign = (licencia: Licencia) => {
    setSelectedLicense(licencia);
    setAssignUserId('');
    setIsAssignModalOpen(true);
  };

  const submitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicense || !assignUserId) return;
    try {
        await api.asignarLicencia(selectedLicense.id, Number(assignUserId));
        setIsAssignModalOpen(false);
        loadData();
    } catch (error: any) {
        alert(error.message);
    }
  };

  const handleUnassign = async (licencia: Licencia) => {
    if (window.confirm(`¿Liberar la licencia asignada a ${licencia.usuario_nombre}?`)) {
        await api.liberarLicencia(licencia.id);
        loadData();
    }
  };

  // -- Helpers --
  const getCounts = (tipoId: number) => {
    const total = licencias.filter(l => l.tipo_id === tipoId).length;
    const available = licencias.filter(l => l.tipo_id === tipoId && !l.usuario_id).length;
    return { total, available };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Key className="w-6 h-6 text-purple-600" /> Gestión de Licencias
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'CATALOG' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" /> Catálogo & Stock
        </button>
        <button
          onClick={() => setActiveTab('ASSIGNMENTS')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'ASSIGNMENTS' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Asignaciones
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {loading ? <div className="text-center py-8">Cargando datos...</div> : (
            <>
                {/* TAB 1: CATALOG & TYPES */}
                {activeTab === 'CATALOG' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {tipos.map(tipo => {
                                const counts = getCounts(tipo.id);
                                return (
                                    <div key={tipo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-800">{tipo.nombre}</h3>
                                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{tipo.proveedor}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-4 min-h-[40px]">{tipo.descripcion}</p>
                                        
                                        <div className="flex justify-between items-end border-t pt-3">
                                            <div className="text-sm">
                                                <div className="text-slate-500">Disponibles: <span className="font-bold text-green-600">{counts.available}</span></div>
                                                <div className="text-slate-500">Total: <span className="font-semibold">{counts.total}</span></div>
                                            </div>
                                            <button 
                                                onClick={() => handleAddStock(tipo.id)}
                                                className="text-sm bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-900 flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Stock
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                            {/* New Type Card Placeholder / Simple Action */}
                             <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-slate-400 hover:border-purple-300 hover:text-purple-600 cursor-pointer transition-colors min-h-[150px]"
                                onClick={() => {
                                    const nombre = prompt("Nombre del nuevo tipo de licencia:");
                                    if (nombre) {
                                        const proveedor = prompt("Proveedor:");
                                        api.createTipoLicencia({ nombre, proveedor: proveedor || 'General', descripcion: '' }).then(loadData);
                                    }
                                }}
                             >
                                <Plus className="w-8 h-8 mb-2" />
                                <span>Nuevo Tipo de Licencia</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: ASSIGNMENTS */}
                {activeTab === 'ASSIGNMENTS' && (
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Licencia / Clave</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Vencimiento</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Asignado A</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {licencias.map(lic => (
                                    <tr key={lic.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-700">{lic.clave}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lic.tipo_nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lic.fecha_vencimiento}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {lic.usuario_id ? (
                                                <div>
                                                    <div className="font-medium text-slate-900">{lic.usuario_nombre}</div>
                                                    <div className="text-xs text-slate-500">{lic.usuario_departamento}</div>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Disponible</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            {lic.usuario_id ? (
                                                <button onClick={() => handleUnassign(lic)} className="text-red-600 hover:text-red-800 font-medium text-xs">Liberar</button>
                                            ) : (
                                                <button onClick={() => handleAssign(lic)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Asignar</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                )}
            </>
        )}
      </div>

      {/* Add Stock Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsStockModalOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Agregar Stock</h3>
                <form onSubmit={submitStock} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Cantidad</label>
                        <input required type="number" min="1" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" value={stockForm.cantidad} onChange={e => setStockForm({...stockForm, cantidad: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Fecha Vencimiento</label>
                        <input required type="date" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" value={stockForm.fechaVencimiento} onChange={e => setStockForm({...stockForm, fechaVencimiento: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsStockModalOpen(false)} className="px-4 py-2 text-slate-600">Cancelar</button>
                        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg">Agregar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsAssignModalOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Asignar Licencia</h3>
                <p className="text-sm text-slate-500 mb-4">Licencia: {selectedLicense?.tipo_nombre} ({selectedLicense?.clave})</p>
                <form onSubmit={submitAssignment} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Usuario</label>
                        <select required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white" value={assignUserId} onChange={e => setAssignUserId(e.target.value)}>
                            <option value="">Seleccionar Usuario...</option>
                            {usuarios.map(u => (
                                <option key={u.id} value={u.id}>{u.nombre_completo} - {u.departamento_nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 text-slate-600">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Asignar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default LicenseManager;
