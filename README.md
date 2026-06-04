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

### 4. Gestión de Perfil y Cuenta
Para la pantalla de **Editar perfil**, utilicen `usuarioService` para la información personal y de seguridad.

- **Consulta inicial**: `usuarioService.getPerfil()` (GET `/api/usuarios/perfil`) para cargar nombre, destinos de interés y `avatarUrl` si existe.
- **Edición de datos y contraseña**: Al guardar, llamen `usuarioService.updatePerfil()` (PUT `/api/usuarios/perfil`). Pueden enviar `nombreUsuario` y un array de `destinosInteres`.
  - **Importante**: Si el usuario quiere cambiar su contraseña, la UI debe exigir y enviar **obligatoriamente** tanto `contrasenaActual` como `nuevaContrasena`. Si la contraseña actual no coincide, el backend devolverá `400 Bad Request` con el mensaje correspondiente.
  - Si solo actualizan nombre o destinos, no envíen campos de contraseña.
- **Eliminación de cuenta**: `usuarioService.deletePerfil()` (DELETE `/api/usuarios/perfil`). El backend realiza un **borrado lógico** para no romper reportes ni relaciones históricas.
  - Tras recibir el `200 OK` de confirmación, la UI debe ejecutar **inmediatamente** `logout()` del contexto (`useAuth`) para limpiar la sesión y redirigir a la pantalla de inicio (o login), **sin** manipular `localStorage` a mano.

```tsx
import { useAuth } from '../contexts/AuthContext';
import { usuarioService } from '../services/usuarioService';

const { logout } = useAuth();

await usuarioService.deletePerfil();
logout();
navigate('/'); // o la ruta de inicio que definan
```

### 5. Carga y Visualización de Imágenes (NUEVO)
Ya está habilitada la subida de imágenes estáticas locales para el **avatar del usuario** y las **portadas de los itinerarios**.

- **Envío de archivos (FormData)**: Las imágenes no se envían en JSON. Capturen el archivo del `<input type="file">` y envíenlo con `FormData`; el navegador genera las cabeceras `multipart/form-data` automáticamente (en el proyecto ya está encapsulado en los servicios).
  - **Perfil**: `usuarioService.uploadAvatar(file)` → POST `/api/usuarios/avatar` con `formData.append('avatar', file)`.
  - **Itinerarios**: `itinerarioService.uploadPortada(itinerarioId, file)` → POST `/api/itinerarios/:id/portada` con `formData.append('portada', file)`.
  - Formatos admitidos: PNG, JPG o JPEG. Tamaño máximo: **5 MB** por archivo.
- **Visualización en UI**: Tras subir, el backend devuelve el objeto actualizado con una ruta relativa en `avatarUrl` o `portadaUrl` (ej. `/uploads/avatars/foto.jpg`). Para renderizarlas en un `<img>`, concatenen la **URL base del servidor** (sin `/api`) con esa ruta parcial. Véase la sección *Variables de Entorno*.

```tsx
// Ejemplo: construir URL pública de una imagen estática
const serverBase = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api\/?$/, '');
const src = usuario.avatarUrl ? `${serverBase}${usuario.avatarUrl}` : '/placeholder-avatar.png';

<img src={src} alt="Avatar" />
```

Por el momento, la subida puede integrarse en **Editar perfil** (avatar) y en el flujo de creación/edición de itinerarios (portada), reutilizando los métodos del servicio sin armar la petición HTTP manualmente en cada pantalla.

---

## 🛠️ Notas Técnicas Importantes para Desarrolladores

### Variables de Entorno
Antes de comenzar a correr la aplicación localmente, asegúrense de copiar el archivo de ejemplo para configurar el entorno:
1. Duplica `.env.example` y renómbralo a `.env`.
2. Ese archivo contiene la variable que apunta al backend en desarrollo:
```env
VITE_API_URL=http://localhost:3000/api
```

**Peticiones API**: Axios usa `VITE_API_URL` como `baseURL` (rutas bajo `/api/...`).

**Imágenes estáticas** (`avatarUrl`, `portadaUrl`): El backend sirve los archivos en la raíz del servidor (ej. `http://localhost:3000/uploads/...`), no bajo `/api`. Para montar el `src` de un `<img>`, quiten el sufijo `/api` de `VITE_API_URL` y concatenen la ruta relativa que devuelve el API:

| Variable | Uso |
|----------|-----|
| `VITE_API_URL` | Llamadas REST (`usuarioService`, `itinerarioService`, etc.) |
| Misma URL sin `/api` | Prefijo para `avatarUrl` y `portadaUrl` en la UI |

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
