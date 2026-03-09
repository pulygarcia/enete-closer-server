# Eneté Closer — Backend API

API central de **Eneté Closer**, sistema de gestión de consignación de vehículos y CRM para intermediarios automotores. Construida con **NestJS**, sigue una arquitectura modular y orientada a servicios para garantizar escalabilidad, orden y mantenimiento sencillo.

> Para detalles técnicos profundos, entidades, endpoints y reglas de negocio → ver [CONTEXT.md](./CONTEXT.md)

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | [NestJS](https://nestjs.com/) (Node.js) v10+ |
| **Lenguaje** | TypeScript ~5.x |
| **Base de Datos** | PostgreSQL 15+ |
| **ORM** | [TypeORM](https://typeorm.io/) ~0.3.x |
| **Autenticación** | [Better Auth](https://www.better-auth.com/) |
| **Autorización** | RBAC por roles (guard) |
| **Validación** | Class-validator + Class-transformer |
| **Documentación** | Swagger / OpenAPI 3.0 → `/api/docs` |
| **Almacenamiento** | Cloudinary SDK |
| **Testing** | Jest (unit tests por servicio) |

---

## Arquitectura y Patrones (Service Pattern)

Para mantener responsabilidad única y facilitar el testing unitario, cada módulo desglosa su lógica en servicios especializados. **Los controllers son finos y no contienen lógica de negocio.**

| Servicio | Responsabilidad |
|---|---|
| `*Creator` | Creación de entidades, validaciones de negocio iniciales y persistencia |
| `*Finder` | Recuperación de datos, filtros dinámicos con QueryBuilder y paginación |
| `*Updater` | Modificación de registros y cambios de estado (`AVAILABLE → RESERVED → SOLD`) |
| `*Deleter` | Soft delete para preservar historial, o físico según el caso |

### Estructura de un módulo
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

### Estructura general del proyecto
```
src/
├── app.module.ts
├── main.ts
├── lib/
│   └── auth.ts             # Configuración Better Auth
├── common/                 # Guards, interceptors, decorators globales
├── owners/                 # Clientes consignantes (CRM)
├── users/                  # Usuarios del sistema
├── vehicles/               # Vehículos en consignación
├── consignments/           # Acuerdo Owner ↔ Vehículo + comisión acordada
└── sales/                  # Registro de ventas y cálculo de comisiones
```

**Prefijo de API:** `/api` | **Swagger:** `/api/docs`

---

## Contexto de Negocio

- **Modelo de intermediación** — Los vehículos pertenecen a terceros (consignantes). La concesionaria los vende y cobra una comisión.
- **Gestión de precios**
  - `owner_price` — Precio mínimo del dueño. **Privado, nunca se expone en endpoints públicos.**
  - `list_price` — Precio de venta al público.
  - `commission` — Calculada al registrar la venta (monto fijo o porcentaje según lo acordado).
- **Formas de pago** — Efectivo, transferencia, permuta, permuta + diferencia, financiado.
- **CRM de consignantes** — Cada vehículo está vinculado a su dueño para seguimiento y contacto.
- **Imágenes** — Máximo 3 por vehículo (Portada, Interior, Detalle). Límite para optimizar costos de Cloudinary.
- **Soft delete generalizado** — Vehículos, consignaciones y ventas conservan historial. No se eliminan físicamente.

---

## Levantar el proyecto
```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Correr migraciones
npm run migration:run

# 4. Desarrollo con hot-reload
npm run start:dev
```

| Comando | Descripción |
|---|---|
| `npm run start:dev` | Desarrollo con hot-reload |
| `npm run build` | Build de producción |
| `npm run start:prod` | Producción |
| `npm run migration:run` | Ejecutar migraciones pendientes |
| `npm run migration:generate` | Generar nueva migración |

---

## Testing
```bash
npm run test          # Todos los unit tests
npm run test:watch    # Modo watch (desarrollo)
npm run test:cov      # Reporte de coverage
```

Lineamientos:
- Mockear todas las dependencias externas (repositorios, Cloudinary, servicios)
- Agrupar con bloques `describe` por método
- Cubrir casos de error y excepciones
- Verificar interacciones con `expect().toHaveBeenCalledWith()`
- Mantener archivos de test bajo 500 líneas

---

## Variables de entorno

Ver `.env.example` en la raíz. Variables requeridas:
```env
PORT=
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```