# Eneté Closer - Backend API

Esta es la API central de **Eneté Closer**, un sistema de gestión de concesionaria y CRM especializado en vehículos de terceros (consignación). Construida con **NestJS**, sigue una arquitectura modular y orientada a servicios para garantizar escalabilidad, orden y un mantenimiento sencillo.

---

## Stack Tecnológico

- **Framework:** [NestJS](https://nestjs.com/) (Node.js) v10+
- **Lenguaje:** TypeScript
- **Base de Datos:** PostgreSQL
- **ORM:** [TypeORM](https://typeorm.io/)
- **Documentación:** Swagger / OpenAPI 3.0
- **Seguridad:** Passport.js + JWT + RBAC
- **Validación:** Class-validator + Class-transformer
- **Testing:** Jest (Unit e Integración)
- **Almacenamiento:** Cloudinary SDK (Gestión de imágenes optimizada)

---

## Arquitectura y Patrones (Service Pattern)

Para mantener la responsabilidad única y facilitar el testing unitario, este proyecto desglosa la lógica de cada módulo en servicios especializados:

- **`*Creator`**: Encargado de la creación de entidades, validaciones de negocio iniciales (ej: verificar que el precio de lista sea mayor al del dueño) y persistencia.
- **`*Finder`**: Especializado en la recuperación de datos, implementación de filtros dinámicos (marca, modelo, transmisión, rangos de precio) mediante **QueryBuilder** y paginación.
- **`*Updater`**: Gestiona la modificación de registros, lógica de cambio de estados (Disponible -> Reservado -> Vendido) y recálculo automático de comisiones.
- **`*Deleter`**: Maneja la eliminación lógica (soft delete) para conservar registros históricos de ventas o física según se requiera.

### Versionado de API
Todos los endpoints están bajo el prefijo `/api/v1/` para asegurar la compatibilidad con futuras versiones del frontend.

---

## Contexto de Negocio

- **Modelo de Intermediación:** El sistema gestiona vehículos que pertenecen a terceros (clientes consignatarios).
- **Gestión de Precios:**
    - `owner_price`: Precio que el dueño real pretende recibir (Privado).
    - `list_price`: Precio de venta al público (Público).
    - **Comisión:** Diferencia calculada dinámicamente entre ambos montos.
- **CRM de Dueños:** Vinculación directa entre cada vehículo y su propietario para seguimiento y contacto rápido.
- **Permutas:** Soporte para indicar si un vehículo acepta "Usado + Diferencia" como parte de pago.
- **Optimización de Medios:** Para minimizar costos de infraestructura, se limita la carga a **3 imágenes de alta calidad por vehículo** (Portada, Interior, Motor/Detalle).

---

## Estructura de un Módulo (Ejemplo: Vehicles)

```text
src/modules/vehicles/
├── dto/                    # Data Transfer Objects (CreateVehicleDto, FilterVehicleDto)
├── entities/               # Definición de tablas de Base de Datos (Vehicle.entity.ts)
├── services/               # Lógica de Negocio Granular
│   ├── vehicle-creator.service.ts
│   ├── vehicle-finder.service.ts
│   ├── vehicle-updater.service.ts
│   └── vehicle-deleter.service.ts
├── vehicles.controller.ts  # Endpoints, Swagger Decorators y Guards
└── vehicles.module.ts      # Registro de dependencias del módulo

### Levantando la Aplicación

| `npm run start` 
| **`npm run start:dev
| `npm run build`

---

### Ejecución de Pruebas (Jest)

```bash
# Ejecutar todos los tests unitarios una sola vez
npm run test