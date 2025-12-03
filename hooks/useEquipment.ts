
import { useState, useEffect } from 'react';
import { Equipo, TipoEquipo, Usuario, Departamento, EstadoEquipo, Ciudad, Pais } from '../types';
import { equipmentService, catalogService } from '../services/equipmentService';
import { api } from '../services/mockApi'; // Direct access for aux data
import { generateAssignmentDocument, getAssignmentDocumentHTML } from '../utils/documentGenerator';
import Swal from 'sweetalert2';

export type ModalAction = 'CREATE' | 'EDIT' | 'ASSIGN' | 'RETURN' | 'BAJA' | 'TO_MAINTENANCE' | 'MARK_DISPOSAL' | null;

export const useEquipment = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [filteredEquipos, setFilteredEquipos] = useState<Equipo[]>([]);
  const [tipos, setTipos] = useState<TipoEquipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [bodegas, setBodegas] = useState<Departamento[]>([]);
  const [cities, setCities] = useState<Ciudad[]>([]);
  const [countries, setCountries] = useState<Pais[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    text: '',
    status: 'ALL',
    type: 'ALL',
    user: 'ALL'
  });

  // Grouping - Default set to TYPE
  const [grouping, setGrouping] = useState<'NONE' | 'TYPE' | 'USER'>('TYPE');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, equipos]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eqData, tipoData, userData, bodegasData, cityData, countryData] = await Promise.all([
        equipmentService.getAll(),
        equipmentService.getTypes(),
        catalogService.getUsers(),
        catalogService.getWarehouses(),
        api.getCiudades(),
        api.getPaises()
      ]);
      setEquipos(eqData);
      setTipos(tipoData);
      setUsuarios(userData);
      setBodegas(bodegasData);
      setCities(cityData);
      setCountries(countryData);
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let res = equipos;
    
    if (filters.text) {
      const lower = filters.text.toLowerCase();
      res = res.filter(e => 
        e.codigo_activo.toLowerCase().includes(lower) ||
        e.modelo.toLowerCase().includes(lower) ||
        e.numero_serie.toLowerCase().includes(lower)
      );
    }
    if (filters.status !== 'ALL') res = res.filter(e => e.estado === filters.status);
    if (filters.type !== 'ALL') res = res.filter(e => e.tipo_equipo_id === Number(filters.type));
    if (filters.user !== 'ALL') res = res.filter(e => e.responsable_id === Number(filters.user));

    setFilteredEquipos(res);
  };

  const handleAction = async (action: ModalAction, equipo: Equipo | null, formData: any) => {
    try {
      if (action === 'CREATE') {
        const bodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
        await equipmentService.create({ ...formData, ubicacion_nombre: bodega?.nombre });
      } else if (action === 'EDIT' && equipo) {
        await equipmentService.update(equipo.id, formData);
      } else if (action === 'ASSIGN' && equipo) {
        
        // --- VALIDACIÓN DE TIPO ÚNICO POR USUARIO ---
        const targetUserId = Number(formData.usuario_id);
        const targetTypeId = equipo.tipo_equipo_id;

        // Buscar si el usuario ya tiene un equipo activo de este tipo
        const existingAssignment = equipos.find(e => 
            e.responsable_id === targetUserId && 
            e.tipo_equipo_id === targetTypeId &&
            e.estado === EstadoEquipo.ACTIVO
        );

        if (existingAssignment) {
            Swal.fire({
                title: 'Asignación no permitida',
                text: `El usuario ya tiene asignado un equipo del tipo "${equipo.tipo_nombre}" (Código: ${existingAssignment.codigo_activo}). Debe realizar la devolución del anterior antes de asignar uno nuevo.`,
                icon: 'warning',
                confirmButtonColor: '#f59e0b'
            });
            return false;
        }
        // ----------------------------------------------

        // 1. Obtener configuración de correo
        const emailConfig = await equipmentService.getEmailConfig();
        const assignedUser = usuarios.find(u => u.id === Number(formData.usuario_id));
        
        // 2. Generar HTML del reporte
        let htmlReport = '';
        if (assignedUser) {
            htmlReport = getAssignmentDocumentHTML(assignedUser, equipo);
        }

        // 3. Evaluar lógica: Si notificar está activo, enviar HTML. Si no, imprimir.
        if (emailConfig.notificar_asignacion) {
            // Enviar con el HTML como "adjunto" simulado
            await equipmentService.assign(equipo.id, formData.usuario_id, formData.ubicacion, formData.observaciones, htmlReport);
            Swal.fire({
                title: 'Asignado',
                text: 'Equipo asignado correctamente. Se ha enviado el acta de entrega por correo electrónico.',
                icon: 'success',
                confirmButtonColor: '#2563eb'
            });
        } else {
            // Asignación estándar sin enviar HTML (la API no enviará correo si check está false, pero por seguridad mandamos undefined)
            await equipmentService.assign(equipo.id, formData.usuario_id, formData.ubicacion, formData.observaciones);
            
            // Imprimir localmente
            if (assignedUser) {
                generateAssignmentDocument(assignedUser, equipo);
            }
        }

      } else if (action === 'RETURN' && equipo) {
        const bodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
        await equipmentService.return(equipo.id, formData.observaciones, Number(formData.ubicacion_id), bodega?.nombre || 'Bodega');
      } else if (action === 'MARK_DISPOSAL' && equipo) {
        const bodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
        await equipmentService.markForDisposal(equipo.id, formData.observaciones, Number(formData.ubicacion_id), bodega?.nombre || 'Bodega IT');
      } else if (action === 'BAJA' && equipo) {
        await equipmentService.dispose(equipo.id, formData.observaciones, formData.evidenceFile);
      } else if (action === 'TO_MAINTENANCE' && equipo) {
        await equipmentService.sendToMaintenance(equipo.id, formData.observaciones);
      }
      await loadData();
      return true;
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error.message || "Error procesando la acción",
        icon: 'error',
        confirmButtonColor: '#2563eb'
      });
      return false;
    }
  };

  const groupedEquipos = (() => {
    if (grouping === 'NONE') return { 'Todos los Equipos': filteredEquipos };
    return filteredEquipos.reduce((acc, item) => {
      let key = grouping === 'TYPE' ? (item.tipo_nombre || 'Sin Tipo') : (item.responsable_nombre || 'Sin Asignar');
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, Equipo[]>);
  })();

  return {
    equipos, filteredEquipos, groupedEquipos,
    tipos, usuarios, bodegas, cities, countries, loading,
    filters, setFilters,
    grouping, setGrouping,
    handleAction
  };
};
