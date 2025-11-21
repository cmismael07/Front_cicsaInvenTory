
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import * as d3 from 'd3-scale';
import { api } from '../services/mockApi';
import { ReporteGarantia, Licencia } from '../types';
import { AlertTriangle, Box, CheckCircle, Wrench, Key } from 'lucide-react';
import StatCard from './StatCard';

interface LicenseSummary {
  name: string;
  total: number;
  available: number;
  assigned: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [warrantyData, setWarrantyData] = useState<ReporteGarantia[]>([]);
  const [licenseStats, setLicenseStats] = useState<LicenseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, warranties, licencias] = await Promise.all([
          api.getStats(),
          api.getWarrantyReport(),
          api.getLicencias()
        ]);
        setStats(statsData);
        setWarrantyData(warranties);
        
        // Calculate License Stats Grouped by Type
        const summaryMap: Record<string, LicenseSummary> = {};

        licencias.forEach(l => {
          if (!summaryMap[l.tipo_nombre]) {
            summaryMap[l.tipo_nombre] = { name: l.tipo_nombre, total: 0, available: 0, assigned: 0 };
          }
          
          summaryMap[l.tipo_nombre].total++;
          if (l.usuario_id) {
            summaryMap[l.tipo_nombre].assigned++;
          } else {
            summaryMap[l.tipo_nombre].available++;
          }
        });

        setLicenseStats(Object.values(summaryMap));

      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !stats) {
    return <div className="p-8 text-center text-gray-500">Cargando Dashboard...</div>;
  }

  // Data for Pie Chart
  const pieData = [
    { name: 'Activos', value: stats.assigned },
    { name: 'Disponibles', value: stats.available },
    { name: 'Mantenimiento', value: stats.maintenance },
    { name: 'Baja', value: stats.retired },
  ];

  // Use D3 to generate a color scale
  const colorScale = d3.scaleOrdinal<string>()
    .domain(['Activos', 'Disponibles', 'Mantenimiento', 'Baja'])
    .range(['#10b981', '#3b82f6', '#f59e0b', '#ef4444']);

  // Data for Warranty Bar Chart
  const barData = warrantyData.slice(0, 5).map(w => ({
    name: w.equipo.codigo_activo,
    dias: w.dias_restantes,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard General</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Total Equipos" 
          value={stats.total} 
          icon={<Box className="w-6 h-6 text-blue-600" />} 
          bgColor="bg-blue-50" 
        />
        <StatCard 
          title="Asignados" 
          value={stats.assigned} 
          icon={<CheckCircle className="w-6 h-6 text-green-600" />} 
          bgColor="bg-green-50" 
        />
        <StatCard 
          title="En Mantenimiento" 
          value={stats.maintenance} 
          icon={<Wrench className="w-6 h-6 text-amber-600" />} 
          bgColor="bg-amber-50" 
        />
         
         {/* Custom License Card showing detailed breakdown */}
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col max-h-40">
            <div className="flex items-center justify-between mb-2">
               <p className="text-sm font-medium text-slate-500">Licencias</p>
               <div className="p-1.5 rounded-lg bg-purple-50">
                  <Key className="w-4 h-4 text-purple-600" />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
               {licenseStats.length === 0 ? (
                 <p className="text-xs text-slate-400 italic text-center mt-4">Sin licencias registradas</p>
               ) : (
                 licenseStats.map((ls, idx) => (
                   <div key={idx} className="border-b border-slate-50 last:border-0 pb-1.5">
                      <p className="text-xs font-bold text-slate-700 truncate mb-0.5" title={ls.name}>{ls.name}</p>
                      <div className="flex justify-between text-[10px] leading-none">
                         <span className="text-slate-500" title="Total">Tot: <b>{ls.total}</b></span>
                         <span className="text-green-600 font-medium" title="Disponibles">Disp: <b>{ls.available}</b></span>
                         <span className="text-blue-600 font-medium" title="Asignadas">Asig: <b>{ls.assigned}</b></span>
                      </div>
                   </div>
                 ))
               )}
            </div>
         </div>

        <StatCard 
          title="Garantías Críticas" 
          value={warrantyData.length} 
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />} 
          bgColor="bg-red-50" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Estado del Inventario</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorScale(entry.name)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Warranty Expiration */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Garantías Próximas a Vencer (Días)</h3>
          {barData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="dias" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400">
              No hay garantías próximas a vencer
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
