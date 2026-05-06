# Backend - Gestión de Itinerarios y Gastos de Viaje

## Códigos de Estado HTTP (Status Codes)

Durante el uso de esta API, recibirás diferentes códigos de estado en las respuestas. Su significado es el siguiente:

- **`200 OK`**: La solicitud fue exitosa. Utilizado en respuestas `GET`, `PUT`, `PATCH` y `DELETE`.
- **`201 Created`**: El recurso se creó exitosamente. Utilizado al registrar usuarios, itinerarios, actividades o gastos (`POST`).
- **`400 Bad Request`**: Hubo un error de validación o una regla de negocio falló (ej. "El correo ya está registrado" o falta un parámetro).
- **`401 Unauthorized`**: El token JWT es inválido, expiró o no se proporcionó. No tienes permisos para acceder a esta ruta.
- **`404 Not Found`**: El recurso que estás intentando buscar no existe en la base de datos.
- **`500 Internal Server Error`**: Ocurrió un error inesperado en el servidor o la base de datos.

---

## 1. Módulo de Usuarios (`/api/usuarios`)

Gestiona el registro, autenticación y perfil del usuario.

### `POST /api/usuarios/registro`
- **¿Qué hace?**: Registra un nuevo usuario, encripta su contraseña y le crea automáticamente un Tablero Social vacío.
- **Requiere Auth**: No.
- **Recibe (Body JSON)**: `{ "nombre": "...", "email": "...", "contraseña": "...", "destinosInteres": ["..."], "presupuestoPerfil": 1000 }`
- **Regresa**: Los datos del usuario (sin contraseña) y un `token` JWT de autenticación.

### `POST /api/usuarios/login`
- **¿Qué hace?**: Valida credenciales e inicia sesión.
- **Requiere Auth**: No.
- **Recibe (Body JSON)**: `{ "email": "...", "contraseña": "..." }`
- **Regresa**: `{ "token": "jwt_token_string" }`

### `GET /api/usuarios/perfil`
- **¿Qué hace?**: Obtiene la información del usuario autenticado y los datos de su tablero social.
- **Requiere Auth**: Sí (Bearer Token).
- **Recibe**: Nada (usa el token).
- **Regresa**: Objeto de `Usuario` completo.

### `PUT /api/usuarios/perfil`
- **¿Qué hace?**: Actualiza preferencias de perfil, incluyendo la posibilidad de actualizar la contraseña (la vuelve a encriptar).
- **Requiere Auth**: Sí.
- **Recibe (Body JSON)**: Cualquier campo de usuario (ej. `{ "presupuestoPerfil": 1500, "destinosInteres": ["París", "Madrid"] }`).
- **Regresa**: Objeto de `Usuario` actualizado.

---

## 2. Módulo de Itinerarios (`/api/itinerarios`)

Gestión de los viajes principales del usuario.

### `POST /api/itinerarios`
- **¿Qué hace?**: Crea un nuevo viaje y se lo asigna al usuario del token automáticamente.
- **Requiere Auth**: Sí.
- **Recibe (Body JSON)**: `{ "destino": "...", "fechaInicio": "YYYY-MM-DD", "fechaFin": "YYYY-MM-DD", "presupuesto": 2000, "notas": "...", "esPublico": false }`
- **Regresa**: El `Itinerario` creado.

### `GET /api/itinerarios`
- **¿Qué hace?**: Lista todos los viajes creados por el usuario activo que no estén eliminados.
- **Requiere Auth**: Sí.
- **Recibe**: Nada.
- **Regresa**: Array de objetos `Itinerario`.

### `GET /api/itinerarios/destacados`
- **¿Qué hace?**: Lista los últimos 10 itinerarios marcados como `esPublico = true` de todos los usuarios.
- **Requiere Auth**: Opcional.
- **Recibe**: Nada.
- **Regresa**: Array de `Itinerario`.

### `GET /api/itinerarios/:id`
- **¿Qué hace?**: Muestra el detalle completo de un itinerario, trayendo sus `actividades` y `gastos` relacionados. Protege la privacidad si el viaje no es público.
- **Requiere Auth**: Opcional (Si el viaje es público no lo requiere, si es privado sí).
- **Recibe (URL Params)**: `id` del itinerario.
- **Regresa**: Objeto `Itinerario` con sus arrays internos de `actividades` y `gastos`.

### `PUT /api/itinerarios/:id`
- **¿Qué hace?**: Edita la información general de un viaje (fechas, presupuesto).
- **Requiere Auth**: Sí.
- **Recibe (Body JSON)**: Propiedades parciales a cambiar.
- **Regresa**: `Itinerario` actualizado.

### `PATCH /api/itinerarios/:id/visibilidad`
- **¿Qué hace?**: Activa o desactiva la bandera `esPublico` del viaje.
- **Requiere Auth**: Sí.
- **Recibe**: Nada.
- **Regresa**: `Itinerario` actualizado.

### `DELETE /api/itinerarios/:id`
- **¿Qué hace?**: Borrado lógico. Cambia el estado del viaje a `ELIMINADO`.
- **Requiere Auth**: Sí.
- **Recibe**: Nada.
- **Regresa**: `{ "message": "Itinerario eliminado correctamente" }`

---

## 3. Módulo de Actividades (`/api/actividades`)

Lo que el usuario planifica hacer dentro de un viaje (Agenda).

### `POST /api/actividades`
- **¿Qué hace?**: Registra una nueva actividad validando que el usuario es dueño del itinerario asociado.
- **Requiere Auth**: Sí.
- **Recibe (Body JSON)**: `{ "itinerarioId": "...", "nombre": "...", "fecha": "YYYY-MM-DD HH:MM", "descripcion": "...", "costoEstimado": 50 }`
- **Regresa**: La `Actividad` creada.

### `PUT /api/actividades/:id`
- **¿Qué hace?**: Edita la actividad validando la propiedad del viaje.
- **Requiere Auth**: Sí.
- **Recibe**: Datos parciales.
- **Regresa**: La `Actividad` actualizada.

### `DELETE /api/actividades/:id`
- **¿Qué hace?**: Borra físicamente la actividad.
- **Requiere Auth**: Sí.
- **Recibe**: Nada.
- **Regresa**: Mensaje de confirmación.

---

## 4. Módulo de Gastos (`/api/gastos`)

Gestión de contabilidad y alertas financieras.

### `POST /api/gastos`
- **¿Qué hace?**: Añade un gasto real. Requiere relacionar una Categoría.
- **Requiere Auth**: Sí.
- **Recibe (Body JSON)**: `{ "itinerarioId": "...", "categoriaId": "...", "monto": 120, "descripcion": "...", "fecha": "...", "esHormiga": false }`
- **Regresa**: El `Gasto` creado.

### `GET /api/gastos/itinerario/:itinerarioId`
- **¿Qué hace?**: Obtiene todos los gastos de un viaje y sus respectivas categorías.
- **Requiere Auth**: Opcional (Si el viaje es público no requiere Auth).
- **Recibe (URL Params)**: `itinerarioId`.
- **Regresa**: Array de `Gasto`.

### `PUT /api/gastos/:id` / `DELETE /api/gastos/:id`
- Edición y eliminación estándar con validación de propiedad.

### `GET /api/gastos/alertas/:itinerarioId`
- **¿Qué hace?**: Lógica avanzada. Compara presupuesto contra suma de gastos reales. Evalúa excesos (>90% o superado) y contabiliza la acumulación de gastos hormiga.
- **Requiere Auth**: Sí (información privada del dueño).
- **Recibe (URL Params)**: `itinerarioId`.
- **Regresa**: Objeto JSON con estadísticas generales y un array de mensajes de advertencia.

---

## 5. Módulo de Categorías (`/api/categorias`)

### `GET /api/categorias`
- **¿Qué hace?**: Devuelve la lista de categorías sembradas en base de datos para armar listas desplegables.
- **Requiere Auth**: Opcional.
- **Recibe**: Nada.
- **Regresa**: Array de `Categoria` con nombre e icono.

---

## 6. Módulo de Sugerencias (`/api/sugerencias`)

### `GET` o `POST /api/sugerencias/generar`
- **¿Qué hace?**: Lee el `presupuestoPerfil` y `destinosInteres` del usuario. Cruza esta información en base de datos usando `TypeORM` para encontrar viajes públicos de otras personas que encajen con esos parámetros. Registra una auditoría en la tabla.
- **Requiere Auth**: Sí.
- **Recibe**: Nada (lee datos del Token JWT).
- **Regresa**: Array de `Itinerario` recomendados.

---

## 7. Módulo Social (`/api/social`)

### `GET /api/social/ranking`
- **¿Qué hace?**: Calcula y genera una tabla de clasificación (Leaderboard) de los usuarios con más viajes públicos y activos en la plataforma.
- **Requiere Auth**: Opcional.
- **Recibe**: Nada.
- **Regresa**: Array Top 10 con la información del tablero social y destinos destacados de cada participante.

---

## 8. Módulo de Reportes (`/api/reportes`)

### `GET /api/reportes/viaje/:itinerarioId`
- **¿Qué hace?**: Elabora un balance financiero profundo del viaje. Agrupa los gastos por categoría (Comida, Vuelos) para gráficas de dona/pastel.
- **Requiere Auth**: Sí.
- **Recibe (URL Params)**: `itinerarioId`.
- **Regresa**: JSON con presupuesto total, balance final y desglose categorizado.

### `GET /api/reportes/periodo?inicio=YYYY-MM-DD&fin=YYYY-MM-DD`
- **¿Qué hace?**: Recupera múltiples viajes en un rango de fechas. Consolida todos los presupuestos de todos los viajes, los gastos y emite un meta-balance. Ideal para ver gráficas anuales.
- **Requiere Auth**: Sí.
- **Recibe (Query Params)**: Parámetros `inicio` y `fin` en la URL.
- **Regresa**: JSON con estadísticas globales.
