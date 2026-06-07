export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  destinosInteres?: string[];
  presupuestoPerfil?: number;
  avatarUrl?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface UpdatePerfilPayload {
  nombreUsuario?: string;
  destinosInteres?: string[];
  presupuestoPerfil?: number;
  contrasenaActual?: string;
  nuevaContrasena?: string;
}

export interface Actividad {
  id: string;
  itinerarioId: string;
  nombre: string;
  descripcion?: string;
  fecha: string; // YYYY-MM-DD HH:MM u otro formato
  costoEstimado?: number;
  direccion?: string;
  latitud?: number;
  longitud?: number;
}

export interface Itinerario {
  id: string;
  usuarioId: string;
  destino: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  presupuesto: number;
  notas?: string;
  esPublico: boolean;
  portadaUrl?: string;
  estado?: 'ACTIVO' | 'ELIMINADO';
  actividades?: Actividad[];
  gastos?: Gasto[];
  usuario?: Pick<Usuario, 'nombre' | 'avatarUrl'>;
  creadoEn?: string;
}

export interface Gasto {
  id: string;
  itinerarioId: string;
  categoriaId: string;
  categoria?: Categoria; // Relación opcional cargada en getByItinerario
  monto: number;
  descripcion?: string;
  fecha: string;
  esHormiga: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
}

export interface AlertaPresupuesto {
  itinerarioId: string;
  presupuestoTotal?: number;
  totalGastado?: number;
  porcentajeUsado?: number;
  alerta?: string;
  estado?: 'ok' | 'advertencia' | 'critico';
  excesos?: string[];
  gastosHormiga?: string[];
}

export interface SocialRankingUser {
  usuarioId: string;
  nombre: string;
  viajesPublicosCount: number;
  destinosDestacados: string[];
}

export interface ReporteViaje {
  itinerario: string;
  fechas: { inicio: string; fin: string };
  presupuesto: number;
  totalGastado: number;
  balance: number;
  desglosePorCategoria: Record<string, number>;
}

export interface ReportePeriodo {
  periodo: { inicio: string; fin: string };
  viajesRealizados: number;
  presupuestoTotal: number;
  gastoTotal: number;
  gastosHormigaTotal: number;
  desglosePorCategoria: Record<string, number>;
  balanceTotal: number;
}
