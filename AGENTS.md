## Contexto Técnico

> **Este archivo es la fuente de verdad técnica del proyecto.**  
> Leelo antes de cualquier tarea de código. Actualizarlo manualmente al agregar un módulo nuevo.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | NestJS | v10+ |
| Lenguaje | TypeScript | ~5.x |
| Base de datos | PostgreSQL | 15+ |
| ORM | TypeORM | ~0.3.x |
| Autenticación | Passport.js + JWT | — |
| Autorización | RBAC (roles por guard) | — |
| Validación | class-validator + class-transformer | — |
| Documentación | Swagger / OpenAPI 3.0 | — |
| Almacenamiento | Cloudinary SDK | — |
| Testing | Jest (unit + integration) | — |

---

## Arquitectura General

```
src/
├── modules/          # Módulos de negocio (uno por dominio)
├── common/           # Guards, decorators, interceptors, pipes globales
├── config/           # Variables de entorno tipadas (ConfigModule)
├── database/         # Configuración TypeORM, migrations
└── main.ts           # Bootstrap: prefijo /api/v1/, Swagger, ValidationPipe global
```

**Prefijo global de API:** `/api/v1/`  
**Swagger UI:** `/api/docs`

---

## Patrón de Módulos (Service Pattern)

Cada módulo desglosa su lógica en servicios especializados.

```
src/modules/<nombre>/
├── dto/
│   ├── create-<nombre>.dto.ts       # Validaciones de entrada (POST)
│   ├── update-<nombre>.dto.ts       # Validaciones de entrada (PATCH)
│   └── filter-<nombre>.dto.ts       # Filtros de búsqueda (GET)
├── entities/
│   └── <nombre>.entity.ts           # Definición de tabla TypeORM
├── services/
│   ├── <nombre>-creator.service.ts  # Lógica de creación + validaciones iniciales
│   ├── <nombre>-finder.service.ts   # Búsqueda, filtros dinámicos, paginación
│   ├── <nombre>-updater.service.ts  # Actualización + cambios de estado
│   └── <nombre>-deleter.service.ts  # Soft delete o físico según contexto
├── <nombre>.controller.ts           # Rutas, Swagger decorators, Guards
└── <nombre>.module.ts               # Registro de providers e imports
```

### Responsabilidades por Servicio

| Servicio | Responsabilidad |
|---|---|
| `*Creator` | Crear entidad, validaciones de negocio previas, persistencia |
| `*Finder` | Queries con QueryBuilder, filtros dinámicos, paginación |
| `*Updater` | Modificar registros, cambios de estado, recalcular comisiones |
| `*Deleter` | Soft delete (histórico) o eliminación física según el módulo |

---

## Módulos del Sistema

> ⚠️ Al agregar un módulo nuevo, completar esta sección con su tabla de campos y endpoints.

---

### `vehicles` — Vehículos en Consignación

**Ruta:** `src/modules/vehicles/`  
**Endpoint base:** `/api/v1/vehicles`

#### Entidad principal: `Vehicle`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | PK generada automáticamente |
| `brand` | string | Marca del vehículo |
| `model` | string | Modelo |
| `year` | number | Año de fabricación |
| `transmission` | enum | `MANUAL` \| `AUTOMATIC` |
| `owner_price` | decimal | Precio privado del dueño (no exponer en API pública) |
| `list_price` | decimal | Precio de venta al público |
| `commission` | decimal | Calculado dinámicamente: `list_price - owner_price` |
| `status` | enum | `AVAILABLE` \| `RESERVED` \| `SOLD` |
| `accepts_trade` | boolean | Acepta permuta (Usado + Diferencia) |
| `owner` | relation | ManyToOne → `Owner` |
| `images` | array | Máx. 3 URLs de Cloudinary |
| `deletedAt` | timestamp | Soft delete (TypeORM `@DeleteDateColumn`) |

#### Reglas de negocio

- `list_price` debe ser **mayor** a `owner_price`. Validar en `VehicleCreator` antes de persistir.
- Máximo **3 imágenes por vehículo** (Portada, Interior, Motor/Detalle). Rechazar si se supera.
- El campo `commission` no se guarda en BD, se calcula en tiempo de consulta o en el servicio.
- El cambio de estado sigue el flujo: `AVAILABLE → RESERVED → SOLD`. No se puede retroceder a `AVAILABLE` desde `SOLD`.

#### Endpoints

| Método | Ruta | Servicio | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/vehicles` | `VehicleFinder` | Listar con filtros (marca, modelo, transmisión, rango de precio) + paginación |
| `GET` | `/api/v1/vehicles/:id` | `VehicleFinder` | Detalle de un vehículo |
| `POST` | `/api/v1/vehicles` | `VehicleCreator` | Crear vehículo (requiere rol `ADMIN`) |
| `PATCH` | `/api/v1/vehicles/:id` | `VehicleUpdater` | Actualizar datos o cambiar estado |
| `DELETE` | `/api/v1/vehicles/:id` | `VehicleDeleter` | Soft delete |

---

### `owners` — Propietarios / Consignatarios

**Ruta:** `src/modules/owners/`  
**Endpoint base:** `/api/v1/owners`

#### Entidad principal: `Owner`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | PK |
| `full_name` | string | Nombre completo |
| `phone` | string | Contacto directo |
| `email` | string | Email (opcional) |
| `vehicles` | relation | OneToMany → `Vehicle` |
| `deletedAt` | timestamp | Soft delete |

#### Reglas de negocio

- Un `Owner` puede tener múltiples vehículos en consignación simultáneamente.
- No eliminar físicamente si tiene vehículos asociados con `status: SOLD` (preservar histórico).

---

### `auth` — Autenticación y Autorización

**Ruta:** `src/modules/auth/`  
**Endpoint base:** `/api/v1/auth`

#### Flujo

1. `POST /auth/login` → valida credenciales → retorna `access_token` (JWT)
2. Todos los endpoints protegidos usan `JwtAuthGuard`
3. Endpoints sensibles (crear/editar/eliminar) usan adicionalmente `RolesGuard`

#### Roles disponibles

| Rol | Permisos |
|---|---|
| `ADMIN` | Acceso total |
| `SELLER` | Lectura + cambio de estado de vehículos |
| `VIEWER` | Solo lectura |

---

## Reglas Globales de Desarrollo

- **DTOs:** Siempre usar `@IsString()`, `@IsEnum()`, `@IsOptional()` de `class-validator`. Nunca validar manualmente en el controller.
- **Responses:** Usar interceptores globales para formato uniforme `{ data, meta }`.
- **Errores:** Lanzar siempre `HttpException` o sus derivados (`NotFoundException`, `BadRequestException`, etc.). Nunca `throw new Error()` crudo.
- **Swagger:** Decorar todos los endpoints con `@ApiOperation`, `@ApiResponse` y `@ApiBearerAuth` donde corresponda.
- **Migraciones:** Cualquier cambio de schema va en una migration de TypeORM. No usar `synchronize: true` en producción.
- **Variables de entorno:** Acceder siempre vía `ConfigService`, nunca con `process.env` directo.

---

## Contexto de Negocio (Resumen)

- **Modelo:** Intermediación — los vehículos pertenecen a terceros, la concesionaria los vende a comisión.
- **Comisión:** `list_price - owner_price`. Dato sensible, no exponer en endpoints públicos.
- **Permutas:** Un vehículo puede aceptar otro usado como parte de pago (`accepts_trade: true`).
- **Imágenes:** Limitadas a 3 por vehículo para optimizar costos de Cloudinary (Portada, Interior, Detalle).
- **Soft delete generalizado:** Preservar historial de ventas. Solo eliminar físicamente en casos excepcionales.