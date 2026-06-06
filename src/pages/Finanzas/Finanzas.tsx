import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiAlertTriangle, FiTrash2 } from 'react-icons/fi';
import { itinerarioService } from '../../services/itinerarioService';
import { gastoService } from '../../services/gastoService';
import { categoriaService } from '../../services/categoriaService';
import type { AlertaPresupuesto, Categoria, Gasto } from '../../interfaces';
import { calcularDuracionDias } from '../../utils/itinerarioHelpers';
import { formatDateToBack } from '../../utils/dateFormatter';
import AlertaToast from '../../components/AlertaToast';
import ReporteViajeModal from '../../components/ReporteViajeModal';
import { FiPieChart } from 'react-icons/fi';

const Finanzas = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [presupuesto, setPresupuesto] = useState<number>(0);
  const [fechaInicio, setFechaInicio] = useState<string | null>(null);
  const [duracionDias, setDuracionDias] = useState<number>(1);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [alertas, setAlertas] = useState<AlertaPresupuesto | null>(null);

  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alerta, setAlerta] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  const [showReporteModal, setShowReporteModal] = useState(false);

  const calcularFechaPorDia = useCallback(
    (dia: number): string => {
      if (!fechaInicio) return formatDateToBack(new Date());
      const date = new Date(fechaInicio.split('T')[0]);
      date.setDate(date.getDate() + (dia - 1));
      return formatDateToBack(date);
    },
    [fechaInicio]
  );

  const cargarDatos = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const [itinerario, cats, gastosData, alertasData] = await Promise.all([
        itinerarioService.getById(id),
        categoriaService.getAll(),
        gastoService.getByItinerario(id),
        gastoService.getAlertas(id),
      ]);

      setPresupuesto(itinerario.presupuesto ?? 0);
      setFechaInicio(itinerario.fechaInicio);
      setDuracionDias(
        calcularDuracionDias(itinerario.fechaInicio, itinerario.fechaFin)
      );
      setCategorias(cats);
      setGastos(gastosData);
      setAlertas(alertasData);

      if (cats.length > 0) {
        setCategoriaId((prev) => prev || cats[0].id);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('No se pudieron cargar los datos de finanzas');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const mostrarToast = (tipo: 'exito' | 'error', mensaje: string) => {
    setAlerta({ tipo, mensaje });
    setTimeout(() => setAlerta(null), 5000);
  };

  const recargarGastosYAlertas = async () => {
    if (!id) return;
    const [gastosData, alertasData] = await Promise.all([
      gastoService.getByItinerario(id),
      gastoService.getAlertas(id),
    ]);
    setGastos(gastosData);
    setAlertas(alertasData);
  };

  const gastoTotal = alertas?.totalGastado ?? gastos.reduce((acc, g) => acc + g.monto, 0);
  const presupuestoTotal = alertas?.presupuestoTotal ?? presupuesto;
  const restante = presupuestoTotal - gastoTotal;
  const porcentajeUsado =
    alertas?.porcentajeUsado ??
    (presupuestoTotal > 0 ? (gastoTotal / presupuestoTotal) * 100 : 0);
  const estadoAlerta =
    alertas?.estado ??
    (porcentajeUsado >= 100 ? 'critico' : porcentajeUsado >= 80 ? 'advertencia' : 'ok');

  const handleGuardarGasto = async () => {
    if (!id) return;

    const val = parseFloat(monto);
    if (!categoriaId) {
      mostrarToast('error', 'Selecciona una categoría');
      return;
    }
    if (isNaN(val) || val <= 0) {
      mostrarToast('error', 'Ingresa un monto válido mayor a cero');
      return;
    }

    setSaving(true);
    try {
      await gastoService.create({
        itinerarioId: id,
        categoriaId,
        monto: val,
        descripcion: descripcion.trim() || undefined,
        fecha: calcularFechaPorDia(diaSeleccionado),
      });

      await recargarGastosYAlertas();
      setDescripcion('');
      setMonto('');
      mostrarToast('exito', 'Gasto registrado correctamente');
    } catch (err) {
      if (err instanceof Error) {
        mostrarToast('error', err.message);
      } else {
        mostrarToast('error', 'Error al guardar el gasto');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarGasto = async (gastoId: string) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;

    setSaving(true);
    try {
      await gastoService.delete(gastoId);
      await recargarGastosYAlertas();
      mostrarToast('exito', 'Gasto eliminado');
    } catch (err) {
      if (err instanceof Error) {
        mostrarToast('error', err.message);
      } else {
        mostrarToast('error', 'Error al eliminar el gasto');
      }
    } finally {
      setSaving(false);
    }
  };

  const getDiaLabel = (fecha: string): number | null => {
    if (!fechaInicio) return null;
    const diff = Math.floor(
      (new Date(fecha.split('T')[0]).getTime() -
        new Date(fechaInicio.split('T')[0]).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return diff >= 0 ? diff + 1 : null;
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center h-screen">
        <p className="text-gray-500">Cargando finanzas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
        >
          <FiArrowLeft size={20} />
          Volver
        </button>
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100">
          <p className="font-semibold text-lg mb-2">Error al cargar finanzas</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 max-w-6xl mx-auto h-screen overflow-y-auto bg-white">
      {alerta && <AlertaToast tipo={alerta.tipo} mensaje={alerta.mensaje} />}

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Ver itinerario</h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 text-xl font-medium"
          >
            <FiArrowLeft size={24} />
            Finanzas
          </button>
        </div>
        <button
          onClick={() => setShowReporteModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 transition shadow-md font-semibold text-lg"
        >
          <FiPieChart size={22} />
          Ver Balance General
        </button>
      </div>

      {alertas && estadoAlerta !== 'ok' && (
        <div
          className={`mb-6 p-5 rounded-xl border flex gap-3 ${
            estadoAlerta === 'critico'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <FiAlertTriangle className="shrink-0 mt-0.5" size={22} />
          <div className="space-y-2">
            <p className="font-semibold">
              {alertas.alerta || 'Atención con tu presupuesto'}
            </p>
            <p className="text-sm opacity-90">
              Has usado el {porcentajeUsado.toFixed(0)}% de tu presupuesto (
              ${gastoTotal} de ${presupuestoTotal}).
            </p>
            {alertas.excesos && alertas.excesos.length > 0 && (
              <ul className="text-sm list-disc list-inside">
                {alertas.excesos.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
            {alertas.gastosHormiga && alertas.gastosHormiga.length > 0 && (
              <div>
                <p className="text-sm font-medium">Gastos hormiga detectados:</p>
                <ul className="text-sm list-disc list-inside">
                  {alertas.gastosHormiga.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-slate-200 p-8 rounded-xl shadow-sm border border-slate-300">
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-slate-300 pb-4">
              <span className="text-xl font-bold text-gray-800">Presupuesto:</span>
              <span className="text-xl font-bold text-gray-800">${presupuestoTotal}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-300 pb-4">
              <span className="text-xl font-bold text-gray-800">Gastos:</span>
              <span className="text-xl font-bold text-gray-800">${gastoTotal}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-300 pb-4">
              <span className="text-xl font-bold text-gray-800">Restante:</span>
              <span
                className={`text-xl font-bold ${restante < 0 ? 'text-red-500' : 'text-gray-800'}`}
              >
                ${restante}
              </span>
            </div>

            {(alertas || presupuestoTotal > 0) && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Uso del presupuesto</span>
                  <span>{porcentajeUsado.toFixed(0)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-300 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      estadoAlerta === 'critico'
                        ? 'bg-red-500'
                        : estadoAlerta === 'advertencia'
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(porcentajeUsado, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-slate-200 p-8 rounded-xl shadow-sm border border-slate-300 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-8">Ingresa un gasto:</h2>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="text-lg font-bold text-gray-800 whitespace-nowrap">
                  Categoría:
                </label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
                >
                  {categorias.length === 0 ? (
                    <option value="">Sin categorías disponibles</option>
                  ) : (
                    categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icono} {cat.nombre}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-lg font-bold text-gray-800 whitespace-nowrap">
                  Gasto del día:
                </label>
                <select
                  value={diaSeleccionado}
                  onChange={(e) => setDiaSeleccionado(parseInt(e.target.value))}
                  className="flex-1 bg-transparent border-b-2 border-slate-400 focus:border-blue-500 focus:outline-none text-lg font-medium text-gray-800 pb-1"
                >
                  {Array.from({ length: duracionDias }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Día {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-lg font-bold text-gray-800 whitespace-nowrap">
                  Concepto:
                </label>
                <input
                  type="text"
                  placeholder="Ingresar"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="flex-1 bg-transparent border-b-2 border-slate-400 focus:border-blue-500 focus:outline-none text-lg font-medium text-gray-800 placeholder-gray-500 pb-1"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-lg font-bold text-gray-800 whitespace-nowrap">
                  Monto total:
                </label>
                <div className="flex-1 flex items-center gap-2 border-b-2 border-slate-400 focus-within:border-blue-500 pb-1">
                  <span className="text-lg font-bold text-gray-800">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="$$$"
                    value={monto}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val < 0) return;
                      setMonto(e.target.value);
                    }}
                    className="w-full bg-transparent focus:outline-none text-lg font-bold text-gray-800 placeholder-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-slate-300">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Registro de gastos:</h3>
              {gastos.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {gastos.map((gasto) => {
                    const dia = getDiaLabel(gasto.fecha);
                    return (
                      <div
                        key={gasto.id}
                        className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-slate-200 gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 text-sm">
                            {gasto.categoria?.icono}{' '}
                            {gasto.categoria?.nombre || 'Gasto'}
                            {dia !== null && ` · Día ${dia}`}
                          </p>
                          <p className="text-slate-600 text-sm truncate">
                            {gasto.descripcion || 'Sin concepto'}
                          </p>
                          {gasto.esHormiga && (
                            <span className="text-xs text-amber-600 font-medium">
                              Gasto hormiga
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-gray-800">${gasto.monto}</span>
                          <button
                            onClick={() => handleEliminarGasto(gasto.id)}
                            disabled={saving}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition disabled:opacity-50"
                            title="Eliminar gasto"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No hay gastos registrados aún.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-12">
            <button
              onClick={handleGuardarGasto}
              disabled={saving || categorias.length === 0}
              className="bg-blue-500 text-white font-semibold text-lg py-2 px-8 rounded-lg hover:bg-blue-600 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar gasto'}
            </button>
          </div>
        </div>
      </div>
      
      {showReporteModal && id && (
        <ReporteViajeModal itinerarioId={id} onClose={() => setShowReporteModal(false)} />
      )}
    </div>
  );
};

export default Finanzas;
