

import { Equipo, EstadoEquipo, RolUsuario, Usuario, ReporteGarantia, Notificacion, TipoEquipo, HistorialMovimiento, Departamento, Puesto, HistorialAsignacion, RegistroMantenimiento, TipoLicencia, Licencia, Ciudad, PlanMantenimiento, DetallePlan, EvidenciaMantenimiento, EstadoPlan, FrecuenciaMantenimiento } from '../types';
import { liveApi } from './liveApi';

// --- CONFIGURACIÓN DEL BACKEND ---
// Cambia esto a TRUE cuando tengas tu backend Laravel corriendo en localhost:8000
const USE_LIVE_API = false; 
// ---------------------------------

// --- Mock Data Initialization ---

let MOCK_CIUDADES: Ciudad[] = [
  { id: 1, nombre: 'Guayaquil' },
  { id: 2, nombre: 'Quito' },
  { id: 3, nombre: 'Cuenca' }
];

let MOCK_DEPARTAMENTOS: Departamento[] = [
  { id: 1, nombre: 'Tecnología (IT)', es_bodega: true, ciudad_id: 1, ciudad_nombre: 'Guayaquil' },
  { id: 2, nombre: 'Recursos Humanos', es_bodega: false, ciudad_id: 2, ciudad_nombre: 'Quito' },
  { id: 3, nombre: 'Ventas', es_bodega: false, ciudad_id: 1, ciudad_nombre: 'Guayaquil' },
  { id: 4, nombre: 'Finanzas', es_bodega: false, ciudad_id: 3, ciudad_nombre: 'Cuenca' }
];

let MOCK_PUESTOS: Puesto[] = [
  { id: 1, nombre: 'Gerente' },
  { id: 2, nombre: 'Desarrollador' },
  { id: 3, nombre: 'Analista' },
  { id: 4, nombre: 'Vendedor' },
  { id: 5, nombre: 'Soporte Técnico' }
];

// Helper to build full name
const buildName = (n: string, a: string) => `${n} ${a}`;

let MOCK_USERS: Usuario[] = [
  { id: 1, nombre_usuario: 'admin', numero_empleado: 'EMP-001', nombres: 'Admin', apellidos: 'Sistema', nombre_completo: 'Admin Sistema', correo: 'admin@sys.com', password: '123', rol: RolUsuario.ADMIN, departamento_id: 1, departamento_nombre: 'Tecnología (IT)', puesto_id: 1, puesto_nombre: 'Gerente', activo: true },
  { id: 2, nombre_usuario: 'tecnico1', numero_empleado: 'EMP-002', nombres: 'Juan', apellidos: 'Técnico', nombre_completo: 'Juan Técnico', correo: 'juan@sys.com', password: '123', rol: RolUsuario.TECNICO, departamento_id: 1, departamento_nombre: 'Tecnología (IT)', puesto_id: 5, puesto_nombre: 'Soporte Técnico', activo: true },
  { id: 3, nombre_usuario: 'empl1', numero_empleado: 'EMP-003', nombres: 'Maria', apellidos: 'Ventas', nombre_completo: 'Maria Ventas', correo: 'maria@sys.com', password: '123', rol: RolUsuario.USUARIO, departamento_id: 3, departamento_nombre: 'Ventas', puesto_id: 4, puesto_nombre: 'Vendedor', activo: true },
];

let MOCK_TIPOS: TipoEquipo[] = [
  { id: 1, nombre: 'Laptop', descripcion: 'Computadora portátil', frecuencia_anual: 2 },
  { id: 2, nombre: 'Desktop', descripcion: 'Computadora de escritorio', frecuencia_anual: 1 },
  { id: 3, nombre: 'Monitor', descripcion: 'Pantalla externa', frecuencia_anual: 0 },
  { id: 4, nombre: 'Impresora', descripcion: 'Impresora láser o inyección', frecuencia_anual: 1 },
];

let MOCK_EQUIPOS: Equipo[] = [
  { id: 1, codigo_activo: 'EQ-2023-001', numero_serie: 'SN123456', marca: 'Dell', modelo: 'Latitude 5420', tipo_equipo_id: 1, tipo_nombre: 'Laptop', serie_cargador: 'CH-999111', fecha_compra: '2023-01-15', valor_compra: 1200, anos_garantia: 3, estado: EstadoEquipo.ACTIVO, ubicacion_id: 1, ubicacion_nombre: 'Piso 2 - Ventas', responsable_id: 3, responsable_nombre: 'Maria Ventas', observaciones: 'Asignado a ventas', frecuencia_mantenimiento: FrecuenciaMantenimiento.SEMESTRAL },
  { id: 2, codigo_activo: 'EQ-2021-045', numero_serie: 'SN987654', marca: 'HP', modelo: 'ProBook 450', tipo_equipo_id: 1, tipo_nombre: 'Laptop', fecha_compra: '2021-03-10', valor_compra: 900, anos_garantia: 3, estado: EstadoEquipo.DISPONIBLE, ubicacion_id: 2, ubicacion_nombre: 'Bodega IT', observaciones: 'Reingresado, listo para asignar', frecuencia_mantenimiento: FrecuenciaMantenimiento.TRIMESTRAL },
  { id: 3, codigo_activo: 'EQ-2020-012', numero_serie: 'SN456123', marca: 'Lenovo', modelo: 'ThinkCentre M720', tipo_equipo_id: 2, tipo_nombre: 'Desktop', fecha_compra: '2020-05-20', valor_compra: 800, anos_garantia: 4, estado: EstadoEquipo.EN_MANTENIMIENTO, ubicacion_id: 3, ubicacion_nombre: 'Taller Externo', observaciones: 'Falla en disco duro', frecuencia_mantenimiento: FrecuenciaMantenimiento.ANUAL },
  { id: 4, codigo_activo: 'EQ-2019-099', numero_serie: 'SN112233', marca: 'Dell', modelo: 'Optiplex 3060', tipo_equipo_id: 2, tipo_nombre: 'Desktop', fecha_compra: '2019-02-01', valor_compra: 750, anos_garantia: 3, estado: EstadoEquipo.BAJA, ubicacion_id: 4, ubicacion_nombre: 'Almacén Bajas', observaciones: 'Obsoleto, pantalla azul', frecuencia_mantenimiento: FrecuenciaMantenimiento.ANUAL },
  { id: 5, codigo_activo: 'EQ-2024-005', numero_serie: 'SN998877', marca: 'Apple', modelo: 'MacBook Air M2', tipo_equipo_id: 1, tipo_nombre: 'Laptop', fecha_compra: '2024-02-20', valor_compra: 1400, anos_garantia: 1, estado: EstadoEquipo.ACTIVO, ubicacion_id: 1, ubicacion_nombre: 'Dirección General', observaciones: '', frecuencia_mantenimiento: FrecuenciaMantenimiento.BIMESTRAL },
  { id: 6, codigo_activo: 'EQ-2020-055', numero_serie: 'SN554433', marca: 'HP', modelo: 'EliteDisplay', tipo_equipo_id: 3, tipo_nombre: 'Monitor', fecha_compra: '2020-06-15', valor_compra: 200, anos_garantia: 3, estado: EstadoEquipo.ACTIVO, ubicacion_id: 1, ubicacion_nombre: 'Piso 2 - Ventas', observaciones: '', frecuencia_mantenimiento: FrecuenciaMantenimiento.ANUAL },
];

let MOCK_HISTORIAL: HistorialMovimiento[] = [
  { id: 1, equipo_id: 1, equipo_codigo: 'EQ-2023-001', tipo_accion: 'CREACION', fecha: '2023-01-15', usuario_responsable: 'Admin', detalle: 'Ingreso inicial al inventario' },
  { id: 2, equipo_id: 1, equipo_codigo: 'EQ-2023-001', tipo_accion: 'ASIGNACION', fecha: '2023-01-20', usuario_responsable: 'Admin', detalle: 'Asignado a Maria Ventas' },
];

let MOCK_ASIGNACIONES: HistorialAsignacion[] = [
  { id: 1, equipo_codigo: 'EQ-2023-001', equipo_modelo: 'Latitude 5420', usuario_nombre: 'Maria Ventas', usuario_departamento: 'Ventas', fecha_inicio: '2023-01-20', fecha_fin: null, ubicacion: 'Piso 2', archivo_pdf: undefined }
];

let MOCK_MANTENIMIENTOS: RegistroMantenimiento[] = [
  { id: 1, equipo_id: 3, equipo_codigo: 'EQ-2020-012', equipo_modelo: 'ThinkCentre M720', fecha: '2024-03-10', tipo_mantenimiento: 'Correctivo', proveedor: 'Taller Externo', costo: 120, descripcion: 'Cambio de Disco Duro', archivo_orden: 'orden_firmada_001.pdf' }
];

let MOCK_TIPOS_LICENCIA: TipoLicencia[] = [
  { id: 1, nombre: 'Office 365 Business', proveedor: 'Microsoft', descripcion: 'Licencia anual por usuario' },
  { id: 2, nombre: 'Adobe Creative Cloud', proveedor: 'Adobe', descripcion: 'Suite completa de diseño' }
];

let MOCK_LICENCIAS: Licencia[] = [
  { id: 1, tipo_id: 1, tipo_nombre: 'Office 365 Business', clave: 'KEY-001-ABC', fecha_compra: '2024-01-01', fecha_vencimiento: '2025-01-01', usuario_id: 1, usuario_nombre: 'Admin Sistema', usuario_departamento: 'Tecnología (IT)' },
  { id: 2, tipo_id: 1, tipo_nombre: 'Office 365 Business', clave: 'KEY-002-XYZ', fecha_compra: '2024-01-01', fecha_vencimiento: '2025-01-01', usuario_id: null },
  { id: 3, tipo_id: 2, tipo_nombre: 'Adobe Creative Cloud', clave: 'ADB-999-CLD', fecha_compra: '2023-06-15', fecha_vencimiento: '2024-06-15', usuario_id: 2, usuario_nombre: 'Juan Técnico', usuario_departamento: 'Tecnología (IT)' }
];

let MOCK_NOTIFICACIONES: Notificacion[] = [
  { id: 1, titulo: 'Garantía por vencer', mensaje: 'La garantía del equipo EQ-2021-045 vence en 15 días.', fecha: '2024-03-20', leido: false, tipo: 'warning' },
  { id: 2, titulo: 'Mantenimiento programado', mensaje: 'Mantenimiento general de servidores el 25 de Marzo.', fecha: '2024-03-18', leido: true, tipo: 'info' }
];

// --- Mock Planning Data ---
let MOCK_PLANES: PlanMantenimiento[] = [];
let MOCK_DETALLES_PLAN: DetallePlan[] = [];
let MOCK_EVIDENCIAS: EvidenciaMantenimiento[] = [];


const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// --- API Implementation ---

export const api = {
  // Auth
  login: async (email: string, password?: string) => {
    await simulateDelay();
    const user = MOCK_USERS.find(u => u.correo === email && (u.password === password || password === '123'));
    if (!user) throw new Error('Credenciales inválidas');
    if (!user.activo) throw new Error('Usuario inactivo');
    return user;
  },
  changePassword: async (userId: number, newPass: string) => {
    await simulateDelay();
    const u = MOCK_USERS.find(x => x.id === userId);
    if (u) u.password = newPass;
  },

  // Organization
  getDepartamentos: async () => { await simulateDelay(); return [...MOCK_DEPARTAMENTOS]; },
  createDepartamento: async (data: any) => {
    await simulateDelay();
    const newId = MOCK_DEPARTAMENTOS.length + 1;
    const ciudad = MOCK_CIUDADES.find(c => c.id === Number(data.ciudad_id));
    const newItem = { 
        ...data, 
        id: newId,
        ciudad_nombre: ciudad?.nombre
    };
    MOCK_DEPARTAMENTOS.push(newItem);
    return newItem;
  },
  updateDepartamento: async (id: number, data: any) => {
    await simulateDelay();
    const idx = MOCK_DEPARTAMENTOS.findIndex(d => d.id === id);
    if (idx >= 0) {
        const ciudad = data.ciudad_id ? MOCK_CIUDADES.find(c => c.id === Number(data.ciudad_id)) : null;
        MOCK_DEPARTAMENTOS[idx] = { 
            ...MOCK_DEPARTAMENTOS[idx], 
            ...data,
            ...(ciudad ? { ciudad_nombre: ciudad.nombre } : {}) 
        };
        return MOCK_DEPARTAMENTOS[idx];
    }
  },
  deleteDepartamento: async (id: number) => {
    await simulateDelay();
    // VALIDACIÓN: Verificar si hay usuarios asignados a este departamento
    const hasUsers = MOCK_USERS.some(u => u.departamento_id === id);
    if (hasUsers) {
      throw new Error("No se puede eliminar este departamento porque tiene usuarios asignados.");
    }
    const idx = MOCK_DEPARTAMENTOS.findIndex(d => d.id === id);
    if (idx >= 0) {
      MOCK_DEPARTAMENTOS.splice(idx, 1);
    }
  },
  
  getPuestos: async () => { await simulateDelay(); return [...MOCK_PUESTOS]; },
  createPuesto: async (data: any) => {
    await simulateDelay();
    const newId = MOCK_PUESTOS.length + 1;
    const newItem = { ...data, id: newId };
    MOCK_PUESTOS.push(newItem);
    return newItem;
  },
  updatePuesto: async (id: number, data: any) => {
    await simulateDelay();
    const idx = MOCK_PUESTOS.findIndex(p => p.id === id);
    if (idx >= 0) {
        MOCK_PUESTOS[idx] = { ...MOCK_PUESTOS[idx], ...data };
        return MOCK_PUESTOS[idx];
    }
  },
  deletePuesto: async (id: number) => {
    await simulateDelay();
    // VALIDACIÓN
    const hasUsers = MOCK_USERS.some(u => u.puesto_id === id);
    if (hasUsers) {
      throw new Error("No se puede eliminar este puesto porque tiene usuarios asignados.");
    }
    const idx = MOCK_PUESTOS.findIndex(p => p.id === id);
    if (idx >= 0) {
        MOCK_PUESTOS.splice(idx, 1);
    }
  },

  getCiudades: async () => { await simulateDelay(); return [...MOCK_CIUDADES]; },
  createCiudad: async (data: any) => {
      await simulateDelay();
      const newId = MOCK_CIUDADES.length + 1;
      const newItem = { ...data, id: newId };
      MOCK_CIUDADES.push(newItem);
      return newItem;
  },
  updateCiudad: async (id: number, data: any) => {
      await simulateDelay();
      const idx = MOCK_CIUDADES.findIndex(c => c.id === id);
      if (idx >= 0) {
          MOCK_CIUDADES[idx] = { ...MOCK_CIUDADES[idx], ...data };
          return MOCK_CIUDADES[idx];
      }
  },
  deleteCiudad: async (id: number) => {
      await simulateDelay();
      const hasDepts = MOCK_DEPARTAMENTOS.some(d => d.ciudad_id === id);
      if (hasDepts) throw new Error("No se puede eliminar, tiene departamentos asignados.");
      const idx = MOCK_CIUDADES.findIndex(c => c.id === id);
      if (idx >= 0) MOCK_CIUDADES.splice(idx, 1);
  },

  // Users
  getUsuarios: async () => { await simulateDelay(); return [...MOCK_USERS]; },
  createUsuario: async (data: any) => {
    await simulateDelay();
    const newId = MOCK_USERS.length + 1;
    const dept = MOCK_DEPARTAMENTOS.find(d => d.id === Number(data.departamento_id));
    const puesto = MOCK_PUESTOS.find(p => p.id === Number(data.puesto_id));
    
    const newUser = {
      ...data,
      id: newId,
      nombre_completo: `${data.nombres} ${data.apellidos}`,
      departamento_nombre: dept?.nombre,
      puesto_nombre: puesto?.nombre
    };
    MOCK_USERS.push(newUser);
    return newUser;
  },
  updateUsuario: async (id: number, data: any) => {
    await simulateDelay();
    const idx = MOCK_USERS.findIndex(u => u.id === id);
    if (idx >= 0) {
      const dept = data.departamento_id ? MOCK_DEPARTAMENTOS.find(d => d.id === Number(data.departamento_id)) : null;
      const puesto = data.puesto_id ? MOCK_PUESTOS.find(p => p.id === Number(data.puesto_id)) : null;
      
      MOCK_USERS[idx] = {
        ...MOCK_USERS[idx],
        ...data,
        ...(data.nombres || data.apellidos ? { nombre_completo: `${data.nombres || MOCK_USERS[idx].nombres} ${data.apellidos || MOCK_USERS[idx].apellidos}` } : {}),
        ...(dept ? { departamento_nombre: dept.nombre } : {}),
        ...(puesto ? { puesto_nombre: puesto.nombre } : {})
      };
      return MOCK_USERS[idx];
    }
  },
  deleteUsuario: async (id: number) => {
      await simulateDelay();
      const idx = MOCK_USERS.findIndex(u => u.id === id);
      if (idx >= 0) MOCK_USERS.splice(idx, 1);
  },

  // Equipment Types
  getTiposEquipo: async () => { await simulateDelay(); return [...MOCK_TIPOS]; },
  createTipoEquipo: async (data: any) => {
    await simulateDelay();
    const newId = MOCK_TIPOS.length + 1;
    const newItem = { ...data, id: newId };
    MOCK_TIPOS.push(newItem);
    return newItem;
  },
  updateTipoEquipo: async (id: number, data: any) => {
    await simulateDelay();
    const idx = MOCK_TIPOS.findIndex(t => t.id === id);
    if (idx >= 0) {
      MOCK_TIPOS[idx] = { ...MOCK_TIPOS[idx], ...data };
      return MOCK_TIPOS[idx];
    }
  },
  deleteTipoEquipo: async (id: number) => {
    await simulateDelay();
    const idx = MOCK_TIPOS.findIndex(t => t.id === id);
    if (idx >= 0) MOCK_TIPOS.splice(idx, 1);
  },

  // Equipment
  getEquipos: async () => { await simulateDelay(); return [...MOCK_EQUIPOS]; },
  createEquipo: async (data: any) => {
    await simulateDelay();
    const newId = MOCK_EQUIPOS.length + 1;
    const tipo = MOCK_TIPOS.find(t => t.id === Number(data.tipo_equipo_id));
    
    const newItem = {
      ...data,
      id: newId,
      tipo_nombre: tipo?.nombre,
      estado: EstadoEquipo.DISPONIBLE
    };
    MOCK_EQUIPOS.push(newItem);
    // Log Creation
    MOCK_HISTORIAL.push({
      id: MOCK_HISTORIAL.length + 1,
      equipo_id: newId,
      equipo_codigo: newItem.codigo_activo,
      tipo_accion: 'CREACION',
      fecha: new Date().toISOString().split('T')[0],
      usuario_responsable: 'Sistema',
      detalle: 'Ingreso al inventario'
    });
    return newItem;
  },
  updateEquipo: async (id: number, data: any) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
      const oldData = MOCK_EQUIPOS[idx];
      const tipo = data.tipo_equipo_id ? MOCK_TIPOS.find(t => t.id === Number(data.tipo_equipo_id)) : null;
      
      MOCK_EQUIPOS[idx] = {
        ...MOCK_EQUIPOS[idx],
        ...data,
        ...(tipo ? { tipo_nombre: tipo.nombre } : {})
      };
      
      // Log Update (Optional, maybe specific fields)
      return MOCK_EQUIPOS[idx];
    }
  },

  // Actions
  asignarEquipo: async (id: number, usuarioId: number, ubicacion: string, observaciones: string) => {
    await simulateDelay();
    const equipoIdx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    const usuario = MOCK_USERS.find(u => u.id === Number(usuarioId));
    
    if (equipoIdx >= 0 && usuario) {
      const equipo = MOCK_EQUIPOS[equipoIdx];
      
      // Update Equipment
      MOCK_EQUIPOS[equipoIdx] = {
        ...equipo,
        estado: EstadoEquipo.ACTIVO,
        responsable_id: usuario.id,
        responsable_nombre: usuario.nombre_completo,
        ubicacion_nombre: ubicacion, // Physical location desk/office
        observaciones: observaciones || equipo.observaciones
      };

      // Add History
      MOCK_HISTORIAL.push({
        id: MOCK_HISTORIAL.length + 1,
        equipo_id: id,
        equipo_codigo: equipo.codigo_activo,
        tipo_accion: 'ASIGNACION',
        fecha: new Date().toISOString().split('T')[0],
        usuario_responsable: 'Admin',
        detalle: `Asignado a ${usuario.nombre_completo}`
      });

      // Add Assignment History Record
      MOCK_ASIGNACIONES.push({
        id: MOCK_ASIGNACIONES.length + 1,
        equipo_codigo: equipo.codigo_activo,
        equipo_modelo: equipo.modelo,
        usuario_nombre: usuario.nombre_completo,
        usuario_departamento: usuario.departamento_nombre || '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: null,
        ubicacion: ubicacion,
        archivo_pdf: `acta_${equipo.codigo_activo}.pdf` // Mock file
      });
    }
  },

  recepcionarEquipo: async (id: number, observaciones: string, ubicacionId?: number, ubicacionNombre?: string) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
      const prevUser = MOCK_EQUIPOS[idx].responsable_nombre;
      
      MOCK_EQUIPOS[idx] = {
        ...MOCK_EQUIPOS[idx],
        estado: EstadoEquipo.DISPONIBLE,
        responsable_id: undefined,
        responsable_nombre: undefined,
        ubicacion_id: ubicacionId || MOCK_EQUIPOS[idx].ubicacion_id,
        ubicacion_nombre: ubicacionNombre || 'Bodega IT',
        observaciones: observaciones
      };

      // Close Assignment History
      const lastAssign = MOCK_ASIGNACIONES.find(a => a.equipo_codigo === MOCK_EQUIPOS[idx].codigo_activo && a.fecha_fin === null);
      if (lastAssign) {
        lastAssign.fecha_fin = new Date().toISOString().split('T')[0];
      }

      MOCK_HISTORIAL.push({
        id: MOCK_HISTORIAL.length + 1,
        equipo_id: id,
        equipo_codigo: MOCK_EQUIPOS[idx].codigo_activo,
        tipo_accion: 'RECEPCION',
        fecha: new Date().toISOString().split('T')[0],
        usuario_responsable: 'Admin',
        detalle: `Devuelto por ${prevUser}`
      });
    }
  },

  bajaEquipo: async (id: number, motivo: string) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
      MOCK_EQUIPOS[idx].estado = EstadoEquipo.BAJA;
      MOCK_HISTORIAL.push({
        id: MOCK_HISTORIAL.length + 1,
        equipo_id: id,
        equipo_codigo: MOCK_EQUIPOS[idx].codigo_activo,
        tipo_accion: 'BAJA',
        fecha: new Date().toISOString().split('T')[0],
        usuario_responsable: 'Admin',
        detalle: `Motivo: ${motivo}`
      });
    }
  },

  marcarParaBaja: async (id: number, observaciones: string, ubicacionId: number, ubicacionNombre: string) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
        MOCK_EQUIPOS[idx].estado = EstadoEquipo.PARA_BAJA;
        MOCK_EQUIPOS[idx].observaciones = observaciones;
        MOCK_EQUIPOS[idx].ubicacion_id = ubicacionId;
        MOCK_EQUIPOS[idx].ubicacion_nombre = ubicacionNombre;
        
        MOCK_HISTORIAL.push({
            id: MOCK_HISTORIAL.length + 1,
            equipo_id: id,
            equipo_codigo: MOCK_EQUIPOS[idx].codigo_activo,
            tipo_accion: 'PRE_BAJA',
            fecha: new Date().toISOString().split('T')[0],
            usuario_responsable: 'Admin',
            detalle: `Enviado a pre-baja: ${observaciones}`
        });
    }
  },

  enviarAMantenimiento: async (id: number, motivo: string) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
      MOCK_EQUIPOS[idx].estado = EstadoEquipo.EN_MANTENIMIENTO;
      MOCK_EQUIPOS[idx].observaciones = motivo; // Actualizar razón para que se vea en el módulo de mantenimiento

      MOCK_HISTORIAL.push({
        id: MOCK_HISTORIAL.length + 1,
        equipo_id: id,
        equipo_codigo: MOCK_EQUIPOS[idx].codigo_activo,
        tipo_accion: 'MANTENIMIENTO',
        fecha: new Date().toISOString().split('T')[0],
        usuario_responsable: 'Admin',
        detalle: `Enviado a taller: ${motivo}`
      });
    }
  },

  finalizarMantenimiento: async (equipoId: number, data: any, nuevoEstado: string, archivo?: File) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === equipoId);
    if (idx >= 0) {
      // 1. Crear registro de mantenimiento
      MOCK_MANTENIMIENTOS.push({
        id: MOCK_MANTENIMIENTOS.length + 1,
        equipo_id: equipoId,
        equipo_codigo: MOCK_EQUIPOS[idx].codigo_activo,
        equipo_modelo: MOCK_EQUIPOS[idx].modelo,
        fecha: new Date().toISOString().split('T')[0],
        tipo_mantenimiento: data.tipo,
        proveedor: data.proveedor,
        costo: data.costo,
        descripcion: data.descripcion,
        archivo_orden: archivo ? archivo.name : undefined // Mock storage
      });

      // 2. Actualizar equipo
      MOCK_EQUIPOS[idx].estado = nuevoEstado as EstadoEquipo;
      MOCK_EQUIPOS[idx].ultimo_mantenimiento = new Date().toISOString().split('T')[0];
      // IMPORTANT: Limpiar observaciones para que el equipo quede "limpio" tras el mantenimiento
      MOCK_EQUIPOS[idx].observaciones = ''; 
      
      if (data.ubicacionId) {
          MOCK_EQUIPOS[idx].ubicacion_id = data.ubicacionId;
          MOCK_EQUIPOS[idx].ubicacion_nombre = data.ubicacionNombre;
      }
      if (data.serie_cargador) {
        MOCK_EQUIPOS[idx].serie_cargador = data.serie_cargador;
      }

      // 3. Log Historial
      MOCK_HISTORIAL.push({
        id: MOCK_HISTORIAL.length + 1,
        equipo_id: equipoId,
        equipo_codigo: MOCK_EQUIPOS[idx].codigo_activo,
        tipo_accion: 'MANTENIMIENTO',
        fecha: new Date().toISOString().split('T')[0],
        usuario_responsable: 'Admin',
        detalle: `Mantenimiento finalizado (${data.tipo})`
      });

      // 4. (Integration) Check if this equipment was in a Maintenance Plan and update task status
      // CORRECCIÓN: Solo cerrar las tareas que están EN_PROCESO.
      // Las tareas PENDIENTES (futuras) no deben tocarse.
      MOCK_DETALLES_PLAN.forEach(task => {
        if (task.equipo_id === equipoId && task.estado === EstadoPlan.EN_PROCESO) {
            task.estado = EstadoPlan.REALIZADO;
            task.fecha_ejecucion = new Date().toISOString().split('T')[0];
            task.tecnico_responsable = data.proveedor;
        }
      });
    }
  },

  iniciarMantenimientoDesdePlan: async (planDetailId: number, motivo: string) => {
    await simulateDelay();
    // 1. Update Plan Detail
    const detail = MOCK_DETALLES_PLAN.find(d => d.id === planDetailId);
    if (detail) {
        detail.estado = EstadoPlan.EN_PROCESO;
        
        // 2. Update Equipment Status
        const eqIdx = MOCK_EQUIPOS.findIndex(e => e.id === detail.equipo_id);
        if (eqIdx >= 0) {
            MOCK_EQUIPOS[eqIdx].estado = EstadoEquipo.EN_MANTENIMIENTO;
            MOCK_EQUIPOS[eqIdx].observaciones = motivo; // Actualizar razón para que se vea en el módulo de mantenimiento
            
            // 3. Add History
            MOCK_HISTORIAL.push({
                id: MOCK_HISTORIAL.length + 1,
                equipo_id: detail.equipo_id,
                equipo_codigo: MOCK_EQUIPOS[eqIdx].codigo_activo,
                tipo_accion: 'MANTENIMIENTO',
                fecha: new Date().toISOString().split('T')[0],
                usuario_responsable: 'Admin',
                detalle: `Iniciado desde Planificación: ${motivo}`
            });
        }
    }
  },

  subirArchivoAsignacion: async (id: number, file: File) => {
      // Mock upload
      await simulateDelay();
      const idx = MOCK_ASIGNACIONES.findIndex(a => a.id === id);
      if (idx >= 0) {
          MOCK_ASIGNACIONES[idx].archivo_pdf = file.name;
          return MOCK_ASIGNACIONES[idx];
      }
      throw new Error("Asignación no encontrada");
  },

  // --- Licenses ---
  getTipoLicencias: async () => { await simulateDelay(); return [...MOCK_TIPOS_LICENCIA]; },
  createTipoLicencia: async (data: any) => {
    await simulateDelay();
    const newId = MOCK_TIPOS_LICENCIA.length + 1;
    const newItem = { ...data, id: newId };
    MOCK_TIPOS_LICENCIA.push(newItem);
    return newItem;
  },
  updateTipoLicencia: async (id: number, data: any) => {
    await simulateDelay();
    const idx = MOCK_TIPOS_LICENCIA.findIndex(t => t.id === id);
    if (idx >= 0) {
        MOCK_TIPOS_LICENCIA[idx] = { ...MOCK_TIPOS_LICENCIA[idx], ...data };
        return MOCK_TIPOS_LICENCIA[idx];
    }
  },
  deleteTipoLicencia: async (id: number) => {
      await simulateDelay();
      const idx = MOCK_TIPOS_LICENCIA.findIndex(t => t.id === id);
      if (idx >= 0) MOCK_TIPOS_LICENCIA.splice(idx, 1);
  },
  
  getLicencias: async () => { await simulateDelay(); return [...MOCK_LICENCIAS]; },
  agregarStockLicencias: async (tipoId: number, cantidad: number, fechaVencimiento: string) => {
      await simulateDelay();
      const tipo = MOCK_TIPOS_LICENCIA.find(t => t.id === Number(tipoId));
      if (!tipo) throw new Error("Tipo no encontrado");

      for(let i=0; i<cantidad; i++) {
          const newId = MOCK_LICENCIAS.length + 1 + i;
          MOCK_LICENCIAS.push({
              id: newId,
              tipo_id: tipo.id,
              tipo_nombre: tipo.nombre,
              clave: `${tipo.nombre.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*1000)}-${new Date().getFullYear()}`,
              fecha_compra: new Date().toISOString().split('T')[0],
              fecha_vencimiento: fechaVencimiento,
              usuario_id: null,
              usuario_nombre: undefined
          });
      }
      return true;
  },
  asignarLicencia: async (licenciaId: number, usuarioId: number) => {
      await simulateDelay();
      const licIdx = MOCK_LICENCIAS.findIndex(l => l.id === licenciaId);
      const user = MOCK_USERS.find(u => u.id === Number(usuarioId));
      
      if (licIdx >= 0 && user) {
          MOCK_LICENCIAS[licIdx].usuario_id = user.id;
          MOCK_LICENCIAS[licIdx].usuario_nombre = user.nombre_completo;
          MOCK_LICENCIAS[licIdx].usuario_departamento = user.departamento_nombre;
          return MOCK_LICENCIAS[licIdx];
      }
      throw new Error("Error al asignar licencia");
  },
  liberarLicencia: async (licenciaId: number) => {
      await simulateDelay();
      const licIdx = MOCK_LICENCIAS.findIndex(l => l.id === licenciaId);
      if (licIdx >= 0) {
          MOCK_LICENCIAS[licIdx].usuario_id = null;
          MOCK_LICENCIAS[licIdx].usuario_nombre = undefined;
          MOCK_LICENCIAS[licIdx].usuario_departamento = undefined;
          return MOCK_LICENCIAS[licIdx];
      }
      throw new Error("Licencia no encontrada");
  },

  // --- Maintenance Planning ---
  getMaintenancePlans: async () => {
    await simulateDelay();
    return [...MOCK_PLANES];
  },

  getPlanDetails: async (planId: number) => {
      await simulateDelay();
      const plan = MOCK_PLANES.find(p => p.id === planId);
      if (!plan) throw new Error("Plan no encontrado");
      const details = MOCK_DETALLES_PLAN.filter(d => d.plan_id === planId);
      return { plan, details };
  },

  createMaintenancePlan: async (plan: PlanMantenimiento, details: DetallePlan[]) => {
      await simulateDelay();
      MOCK_PLANES.push(plan);
      MOCK_DETALLES_PLAN.push(...details);
      return plan;
  },

  updatePlanDetailMonth: async (detailId: number, newMonth: number) => {
      await simulateDelay();
      const idx = MOCK_DETALLES_PLAN.findIndex(d => d.id === detailId);
      if (idx >= 0) {
          MOCK_DETALLES_PLAN[idx].mes_programado = newMonth;
          return MOCK_DETALLES_PLAN[idx];
      }
  },
  
  registerMaintenanceExecution: async (detailId: number, data: { fecha: string, tecnico: string, observaciones: string, archivo?: File }) => {
      await simulateDelay();
      const idx = MOCK_DETALLES_PLAN.findIndex(d => d.id === detailId);
      if (idx >= 0) {
          MOCK_DETALLES_PLAN[idx].estado = EstadoPlan.REALIZADO;
          MOCK_DETALLES_PLAN[idx].fecha_ejecucion = data.fecha;
          MOCK_DETALLES_PLAN[idx].tecnico_responsable = data.tecnico;
          
          if (data.archivo) {
              MOCK_EVIDENCIAS.push({
                  id: MOCK_EVIDENCIAS.length + 1,
                  detalle_plan_id: detailId,
                  plan_id: MOCK_DETALLES_PLAN[idx].plan_id,
                  equipo_id: MOCK_DETALLES_PLAN[idx].equipo_id,
                  fecha_subida: new Date().toISOString(),
                  archivo_url: URL.createObjectURL(data.archivo), // Mock URL
                  tipo_archivo: data.archivo.type.includes('pdf') ? 'pdf' : 'imagen',
                  observaciones: data.observaciones
              });
          }
      }
  },

  getEvidence: async (detailId: number) => {
      await simulateDelay();
      return MOCK_EVIDENCIAS.find(e => e.detalle_plan_id === detailId);
  },

  // --- Stats & Reports ---
  getStats: async () => {
    // This is handled by useDashboardData mostly, but if we need a raw call:
    return {}; 
  },
  getWarrantyReport: async () => {
    // Filter active equipment
    const activeEq = MOCK_EQUIPOS.filter(e => e.estado !== EstadoEquipo.BAJA);
    const report: ReporteGarantia[] = [];
    
    activeEq.forEach(eq => {
        const purchaseDate = new Date(eq.fecha_compra);
        const warrantyEnd = new Date(purchaseDate);
        warrantyEnd.setFullYear(purchaseDate.getFullYear() + eq.anos_garantia);
        
        const today = new Date();
        const diffTime = warrantyEnd.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 90) { // Next 3 months or expired
            report.push({
                equipo: eq,
                dias_restantes: diffDays,
                fecha_vencimiento: warrantyEnd.toISOString().split('T')[0]
            });
        }
    });
    return report;
  },
  getReplacementCandidates: async () => {
    // Logic: Equipment older than 4 years
    const activeEq = MOCK_EQUIPOS.filter(e => e.estado !== EstadoEquipo.BAJA);
    const today = new Date();
    return activeEq.filter(eq => {
        const purchaseDate = new Date(eq.fecha_compra);
        const ageYears = (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return ageYears >= 4;
    });
  },
  getHistorial: async (tipoId?: number) => {
    await simulateDelay();
    if (tipoId) {
        // Filter history by equipment that matches the type
        const eqsOfType = MOCK_EQUIPOS.filter(e => e.tipo_equipo_id === tipoId).map(e => e.id);
        return MOCK_HISTORIAL.filter(h => eqsOfType.includes(h.equipo_id)).sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }
    return MOCK_HISTORIAL.sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  },
  getHistorialAsignaciones: async () => { await simulateDelay(); return [...MOCK_ASIGNACIONES]; },
  getHistorialMantenimiento: async (tipoId?: number) => { 
      await simulateDelay(); 
      if (tipoId) {
         const eqsOfType = MOCK_EQUIPOS.filter(e => e.tipo_equipo_id === tipoId).map(e => e.id);
         return MOCK_MANTENIMIENTOS.filter(m => eqsOfType.includes(m.equipo_id)).sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      }
      return [...MOCK_MANTENIMIENTOS].sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); 
  },
  getNotifications: async () => { await simulateDelay(); return [...MOCK_NOTIFICACIONES]; }
};
