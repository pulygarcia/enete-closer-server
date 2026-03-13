# CONTEXT.md — Eneté Closer Backend API

> Leelo antes de cualquier tarea de código. Actualizarlo manualmente al agregar un módulo nuevo.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | NestJS | v10+ |
| Lenguaje | TypeScript | ~5.x |
| Base de datos | PostgreSQL | 15+ |
| ORM | TypeORM | ~0.3.x |
| Autenticación | Better Auth (`better-auth` + `@thallesp/nestjs-better-auth`) | — |
| Autorización | RBAC por roles (guard) | — |
| Validación | class-validator + class-transformer | — |
| Documentación | Swagger / OpenAPI 3.0 | — |
| Almacenamiento | Cloudinary SDK | — |
| Testing | Jest (unit tests por servicio) | — |

---

## Arquitectura General
```
src/
├── app.module.ts       # Registro de todos los módulos
├── main.ts             # Bootstrap: prefijo /api, Swagger, ValidationPipe global
├── lib/
│   └── auth.ts         # Configuración Better Auth
├── common/             # Guards, decorators, interceptors, pipes globales
├── config/             # Variables de entorno tipadas (ConfigService)
├── database/           # Configuración TypeORM, migrations
├── owners/             # Clientes consignantes
├── users/              # Usuarios del sistema (admin, seller, viewer)
├── vehicles/           # Vehículos en consignación
├── consignments/       # Relación Owner ↔ Vehicle (precio mínimo + comisión)
└── sales/              # Registro de ventas y cálculo de comisión
```

**Prefijo global de API:** `/api`
**Swagger UI:** `/api/docs`

---

## Patrón de Módulos (Service Pattern)
```
src/<módulo>/
├── dto/
│   ├── create-<módulo>.dto.ts
│   ├── update-<módulo>.dto.ts
│   └── filter-<módulo>.dto.ts
├── entities/
│   └── <módulo>.entity.ts
├── services/
│   ├── <módulo>-creator.service.ts
│   ├── <módulo>-finder.service.ts
│   ├── <módulo>-updater.service.ts
│   └── <módulo>-deleter.service.ts
├── <módulo>.controller.ts
└── <módulo>.module.ts
```

> **Regla base:** Controllers finos. Toda la lógica de negocio vive en los Services.

---

## Índice Rápido

| Si buscás… | Archivos clave |
|---|---|
| Rutas / endpoints | `*.controller.ts` en cada módulo |
| Lógica de creación | `*-creator.service.ts` |
| Lógica de búsqueda/listado | `*-finder.service.ts` |
| Lógica de actualización | `*-updater.service.ts` |
| Lógica de eliminación | `*-deleter.service.ts` |
| Validación de entrada | `dto/create-*.dto.ts`, `dto/update-*.dto.ts` |
| Filtros de GET | `dto/filter-*.dto.ts` |
| Definición de tablas | `entities/*.entity.ts` |
| Auth / sesiones / roles | `src/lib/auth.ts` |
| Registro de módulos | `src/app.module.ts` |
| Bootstrap / prefijo API | `src/main.ts` |

---

## Estructura Actual del Proyecto
```
src/
├── app.module.ts
├── main.ts
├── lib/
│   └── auth.ts
├── owners/
│   ├── dto/
│   │   ├── create-owner.dto.ts
│   │   └── update-owner.dto.ts
│   ├── entities/
│   │   └── owner.entity.ts
│   ├── services/
│   │   ├── owner-creator.service.ts
│   │   ├── owner-finder.service.ts
│   │   ├── owner-updater.service.ts
│   │   └── owner-deleter.service.ts
│   ├── owners.controller.ts
│   └── owners.module.ts
├── users/
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   └── filter-user.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── services/
│   │   ├── user-finder.service.ts
│   │   ├── user-updater.service.ts
│   │   └── user-deleter.service.ts
│   ├── users.controller.ts
│   └── users.module.ts
└── vehicles/
    ├── dto/
    │   ├── create-vehicle.dto.ts
    │   └── update-vehicle.dto.ts
    ├── entities/
    │   └── vehicle.entity.ts
    ├── services/
    │   ├── vehicle-creator.service.ts
    │   ├── vehicle-finder.service.ts
    │   ├── vehicle-updater.service.ts
    │   └── vehicle-deleter.service.ts
    ├── vehicles.controller.ts
    └── vehicles.module.ts
```

---

## Módulos del Sistema

---

### `owners` — Clientes Consignantes

**Ruta:** `src/owners/`
**Endpoint base:** `/api/owners`

#### Entidad: `Owner`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | PK |
| `fullName` | string | Nombre completo |
| `phone` | string | Teléfono de contacto (único) |
| `email` | string | Email (nullable) |
| `observation` | text | Notas internas sobre el cliente (nullable) |
| `vehicles` | relation | OneToMany → `Vehicle` |
| `createdAt` | timestamp | Fecha de creación |
| `updatedAt` | timestamp | Fecha de actualización |
| `deletedAt` | timestamp | Soft delete |

#### Reglas de negocio

- Un `Owner` puede tener múltiples vehículos en consignación simultáneamente.
- No eliminar físicamente si tiene vehículos con `status: SOLD` (preservar histórico).

---

### `vehicles` — Vehículos en Consignación

**Ruta:** `src/vehicles/`
**Endpoint base:** `/api/vehicles`

#### Entidad: `Vehicle`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | PK |
| `brand` | string | Marca |
| `model` | string | Modelo |
| `year` | number | Año de fabricación |
| `km` | number | Kilometraje |
| `transmission` | enum | `Manual` \| `Automático` (Transmission enum) |
| `owner_price` | decimal | Precio mínimo del dueño *(privado, nunca exponer en API pública)* |
| `list_price` | decimal | Precio de venta al público |
| `accepts_trade` | boolean | Acepta permuta (default: false) |
| `status` | enum | `AVAILABLE` \| `RESERVED` \| `SOLD` (default: AVAILABLE) |
| `images` | array | URLs de Cloudinary (máx. 3) |
| `owner` | relation | ManyToOne → `Owner` |
| `createdAt` | timestamp | Fecha de creación |
| `updatedAt` | timestamp | Fecha de actualización |
| `deletedAt` | timestamp | Soft delete |

> **Campos planificados** (consignments/sales): `color`, `fuel`, `doors`, `condition`, `description`, `payment_methods`, `trade_conditions`, `consignment`.

#### Formas de pago (`payment_methods`) *(próximo)*
```typescript
enum PaymentMethod {
  CASH        = 'CASH',         // Efectivo
  TRANSFER    = 'TRANSFER',     // Transferencia bancaria
  TRADE       = 'TRADE',        // Permuta directa
  TRADE_DIFF  = 'TRADE_DIFF',   // Permuta + diferencia en efectivo
  FINANCED    = 'FINANCED',     // Financiado por gestora externa
}
```

#### Flujo de estados
```
AVAILABLE → RESERVED → SOLD
     ↑___________|
  (se cayó la venta)

Regla: no se puede volver a AVAILABLE desde SOLD.
```

#### Reglas de negocio

- `list_price` debe ser **mayor** a `owner_price`. Validar en `VehicleCreator`.
- Máximo **3 imágenes** por vehículo. Rechazar si se supera.
- `owner_price` nunca debe aparecer en respuestas de endpoints públicos (`@Exclude()` o DTO separado).
- Al pasar a `SOLD` se dispara la creación del registro en `Sales`.

---

### `users` — Usuarios del Sistema

**Ruta:** `src/users/`
**Endpoint base:** `/api/users`

> La creación de usuarios se hace vía Better Auth. No existe `UserCreator`.

#### Entidad: `User`

> Esquema manejado por Better Auth (tabla `user`, `synchronize: false`). Campos adicionales vía `user.additionalFields`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | PK (varchar 255, generado por Better Auth) |
| `name` | string | Nombre completo |
| `email` | string | Email único |
| `emailVerified` | boolean | Email verificado (default: false) |
| `image` | string | URL avatar (nullable) |
| `role` | enum | `ADMIN` \| `SELLER` \| `VIEWER` (default: VIEWER) |
| `createdAt` | timestamp | Fecha de creación |
| `updatedAt` | timestamp | Fecha de última actualización |

> **Nota:** No usa `deletedAt` (el esquema lo gestiona Better Auth). El `UserDeleter` realiza eliminación física.

#### Roles

| Rol | Default | Permisos |
|---|---|---|
| `ADMIN` | — | Acceso total |
| `SELLER` | — | Lectura + cambio de estado de vehículos |
| `VIEWER` | ✅ | Solo lectura |


---

### `auth` — Autenticación

**Ruta:** `src/lib/auth.ts`
**Endpoint base:** `/api/auth`

> Manejado íntegramente por Better Auth. No tiene carpeta de módulo propia.

- `POST /api/auth/sign-in/email` — Login
- `POST /api/auth/sign-up/email` — Registro
- `POST /api/auth/sign-out` — Logout
- Decorator `@AllowAnonymous()` para rutas públicas
- Por defecto todos los endpoints requieren sesión activa

---

### `consignments` — Consignaciones *(próximo)*

**Ruta:** `src/consignments/`
**Endpoint base:** `/api/consignments`

> Representa el acuerdo formal entre el Owner y la concesionaria para vender un vehículo.

#### Entidad: `Consignment`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | PK |
| `owner` | relation | ManyToOne → `Owner` |
| `vehicle` | relation | OneToOne → `Vehicle` |
| `agreed_min_price` | decimal | Precio mínimo acordado con el dueño |
| `commission_type` | enum | `FIXED` \| `PERCENTAGE` |
| `commission_value` | decimal | Monto fijo o porcentaje según tipo |
| `status` | enum | `ACTIVE` \| `SOLD` \| `WITHDRAWN` |
| `notes` | text | Notas del acuerdo |
| `intake_date` | date | Fecha de ingreso del vehículo |
| `deletedAt` | timestamp | Soft delete |

#### Reglas de negocio

- Al crear una `Consignment`, el vehículo pasa automáticamente a `AVAILABLE`.
- Al pasar a `SOLD`, se genera automáticamente el registro en `Sales`.
- `WITHDRAWN` = el dueño retiró el vehículo sin venderse.

---

### `sales` — Ventas y Comisiones *(próximo)*

**Ruta:** `src/sales/`
**Endpoint base:** `/api/sales`

#### Entidad: `Sale`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | PK |
| `vehicle` | relation | OneToOne → `Vehicle` |
| `consignment` | relation | OneToOne → `Consignment` |
| `sale_price` | decimal | Precio final de venta |
| `payment_method_used` | enum | `PaymentMethod` utilizado |
| `trade_vehicle_description` | text | Descripción del vehículo recibido en permuta (si aplica) |
| `commission_earned` | decimal | Comisión calculada automáticamente al momento de la venta |
| `sale_date` | date | Fecha de la venta |
| `notes` | text | Notas adicionales |

#### Reglas de negocio

- `commission_earned` se calcula al crear la `Sale` según el tipo acordado en `Consignment`:
  - `FIXED`: `commission_value` directo.
  - `PERCENTAGE`: `sale_price * (commission_value / 100)`.
- Una vez creada, la `Sale` es **inmutable** (preservar histórico contable).
- Al crear la `Sale`, el vehículo pasa a `SOLD` y la consignación a `SOLD`.

---

## Reglas Globales de Desarrollo

- **DTOs:** Siempre usar decoradores de `class-validator`. Nunca validar manualmente en el controller.
- **Responses:** Interceptor global con formato uniforme `{ data, meta }`.
- **Errores:** Siempre `HttpException` o sus derivados (`NotFoundException`, `BadRequestException`, etc.). Nunca `throw new Error()` crudo.
- **Swagger:** Decorar todos los endpoints con `@ApiOperation`, `@ApiResponse` y `@ApiBearerAuth` donde corresponda.
- **Datos privados:** `owner_price` y `commission` nunca en respuestas públicas. Usar DTOs de respuesta separados o `@Exclude()`.
- **Migraciones:** Todo cambio de schema en una migration de TypeORM. `synchronize: true` solo en desarrollo local.
- **Variables de entorno:** Siempre vía `ConfigService`, nunca `process.env` directo.
- **Soft delete generalizado:** Entidades con historial (vehículos, consignaciones, ventas) usan `@DeleteDateColumn`.


## Testing ** Jest **

- Testear todos los métodos del servicio y sus casos borde
- Mockear **todas** las dependencias externas (repositorios, servicios, Cloudinary)
- Nombres de tests descriptivos en español o inglés
- Agrupar con bloques `describe` por método
- Cubrir escenarios de error y excepciones
- Verificar interacciones con `expect().toHaveBeenCalledWith()`
- Mantener archivos de test bajo 500 líneas (dividir si es necesario)

### Alcance del testing

- **Services** — cobertura obligatoria al 80% mínimo. Es donde vive toda la lógica de negocio.
- **Controllers** — no se testean por ahora. Los controllers son finos y no contienen lógica.
  En el futuro, si se implementa lógica de autorización compleja, guards custom o transformación
  de respuesta específica en algún controller, se agregarán tests para ese caso puntual.
- **DTOs / Entities** — no se testean directamente.