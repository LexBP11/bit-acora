# Bit-Acora - Frontend

## 📋 Guía de Uso para el Equipo de UI

A continuación, se detalla cómo deben utilizar los módulos que se han implementado para conectar las vistas con el servidor:

### 1. Gestión de Gastos y Alertas
Para la pantalla de finanzas, deben usar el servicio de gastos (`gastoService`). Este servicio no solo registra transacciones, sino que es el encargado de comunicar las alertas de gastos hormiga y presupuesto comprometido definidas en las reglas de negocio.
- **Registro de Gasto**: Al guardar un gasto, deben enviar la categoría obligatoria (`categoriaId`) y el monto.
- **Alertas**: Deben consumir `gastoService.getAlertas(itinerarioId)`. Este método devolverá un array de advertencias si el gasto acumulado supera el 80% del presupuesto asignado.

### 2. Visualización de Reportes
Para la generación de estadísticas por viaje o periodo, deben utilizar el `reporteService`.
- **Balance por Viaje**: Proporciona el desglose por categorías (Comida, Transporte, etc.) para las gráficas de pastel.
- **Filtros de Fecha**: Para reportes anuales, deben pasar los parámetros de fecha en formato `YYYY-MM-DD`. *(Pueden apoyarse en `src/utils/dateFormatter.ts`)*.

### 3. Gamificación y Social
El sistema de rachas y el tablero social se actualizan automáticamente a través del backend, pero la UI debe consultar estos datos para mostrarlos en el perfil (vía `socialService`).
- **Rachas**: Si el usuario no registra gastos en 24 horas, el sistema reinicia la racha a cero. La UI solo debe mostrar este valor sin posibilidad de editarlo para mantener la integridad del juego.
- **Privacidad**: Al publicar un itinerario en la sección comunitaria, el sistema oculta automáticamente todos los datos financieros; los compañeros de UI no necesitan filtrar esto manualmente, ya que el servicio lo hace por seguridad.

---

## 🛠️ Notas Técnicas Importantes para Desarrolladores

### Variables de Entorno
Antes de comenzar a correr la aplicación localmente, asegúrense de copiar el archivo de ejemplo para configurar el entorno:
1. Duplica `.env.example` y renómbralo a `.env`.
2. Ese archivo contiene la variable que apunta al backend en desarrollo:
```env
VITE_API_URL=http://localhost:3000/api
```

### Manejo de Sesión (Tokens y LocalStorage)
**IMPORTANTE**: Por motivos de consistencia de estado, **no manipulen el `localStorage` directamente** para insertar, leer o borrar el JWT. 
En su lugar, utilicen siempre nuestro contexto global de autenticación:
```tsx
import { useAuth } from '../contexts/AuthContext';

// Dentro de un componente:
const { user, login, logout, isAuthenticated } = useAuth();
```
El método `login` y `logout` ya se encargan de gestionar el token y actualizar toda la aplicación en tiempo real.

### Manejo de Errores y Estado (Hooks)
La capa de servicios (`src/services/`) está diseñada para interceptar los errores de Axios y devolver los mensajes literales del backend (ej. `400 Bad Request` "El correo ya existe").

Para hacer el código más limpio, te sugerimos crear Custom Hooks para cada pantalla. **Revisa el archivo `src/hooks/useItinerarios.ts` como ejemplo rector**. Allí verás cómo agrupar un servicio, estado de `loading` y estado de `error` para consumirlo tan fácil como:

```tsx
const { data, loading, error } = useGetItinerarioDetail(id);

if (loading) return <Spinner />;
if (error) return <div className="text-red-500">{error}</div>;

return <VistaDetalle datos={data} />;
```
De esta manera, la UI solo se enfoca en pintar la pantalla y la lógica de red permanece separada.
