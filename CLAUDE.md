# CLAUDE.md — Eneté Closer Backend

> Este archivo es leído automáticamente por Claude Code al inicio de cada sesión.

---

## Stack

- **NestJS v10** + **TypeScript ~5** + **TypeORM ~0.3** + **PostgreSQL 15**
- **Auth:** Better Auth (`@thallesp/nestjs-better-auth`) — no crear UserCreator, la auth la maneja Better Auth
- **Validación:** `class-validator` + `class-transformer`
- **Tests:** Jest (solo services, mínimo 80% cobertura)

---

## Estructura de módulos

```
src/<módulo>/
├── dto/            create-*.dto.ts | update-*.dto.ts | filter-*.dto.ts
├── entities/       <módulo>.entity.ts
├── services/       <módulo>-creator | finder | updater | deleter  (.service.ts + .spec.ts)
├── <módulo>.controller.ts
└── <módulo>.module.ts
```

**Regla:** Controllers finos — cero lógica de negocio. Todo va en los Services.

---

## Convenciones críticas de código

### Naming de clases de servicio
Los servicios NO llevan el sufijo `Service` en su nombre de clase (excepción: `DashboardFinderService`):
```typescript
// ✅ Correcto
export class OwnerCreator { ... }
export class VehicleFinder { ... }

// ❌ Incorrecto
export class OwnerCreatorService { ... }
```

### Método principal en servicios
- Creator / Updater / Deleter → método principal se llama `run()`
- Finder → métodos `findAll()` y `findById(id: string)`

### Decimales en entidades
Siempre `precision: 12, scale: 2` para campos monetarios:
```typescript
@Column({ type: 'decimal', precision: 12, scale: 2 })
price: number;
```

### Errores
Siempre usar excepciones de NestJS. **Nunca** `throw new Error()`:
```typescript
throw new NotFoundException('Mensaje');
throw new ConflictException('Mensaje');
throw new BadRequestException('Mensaje');
```

### Variables de entorno
Siempre via `ConfigService`. **Nunca** `process.env.X` directo.

---

## Módulos actuales (todos implementados)

| Módulo | Endpoint | Estado |
|---|---|---|
| `owners` | `/api/owners` | ✅ Completo |
| `vehicles` | `/api/vehicles` | ✅ Completo |
| `users` | `/api/users` | ✅ Completo |
| `consignments` | `/api/consignments` | ✅ Completo |
| `sales` | `/api/sales` | ✅ Completo |
| `dashboard` | `/api/dashboard` | ✅ Completo |
| `auth` | `/api/auth` | ✅ Better Auth |

---

## Entidades — campos reales

### Owner
`id` · `fullName` · `phone` (unique) · `email` (nullable) · `observation` (nullable) · `vehicles` (OneToMany→Vehicle) · `createdAt` · `updatedAt` · `deletedAt`

### Vehicle
`id` · `plate` (unique) · `brand` · `model` · `year` · `km` · `transmission` (enum) · `condition` (enum, nullable) · `description` (nullable) · `trade_conditions` (nullable) · `owner_price` (decimal, privado) · `list_price` (decimal) · `accepts_trade` (bool) · `fuel` (enum, nullable) · `status` (enum) · `images` (simple-array, máx 3) · `owner` (ManyToOne→Owner, CASCADE) · `createdAt` · `updatedAt` · `deletedAt`

### Consignment
`id` · `owner` (ManyToOne→Owner, CASCADE) · `vehicle` (OneToOne→Vehicle, CASCADE) · `agreed_min_price` · `commission_type` (FIXED|PERCENTAGE) · `commission_value` · `status` (ACTIVE|SOLD|WITHDRAWN) · `notes` (nullable) · `intake_date` · `createdAt` · `updatedAt` · `deletedAt`

### Sale (inmutable — sin `updatedAt`)
`id` · `vehicle` (OneToOne→Vehicle, CASCADE) · `consignment` (OneToOne→Consignment, CASCADE) · `sale_price` · `payment_method_used` (enum) · `trade_vehicle_description` (nullable) · `commission_earned` · `sale_date` · `notes` (nullable) · `createdAt` · `deletedAt`

### User (gestionado por Better Auth — `synchronize: false`)
`id` (varchar 255) · `name` · `email` (unique) · `emailVerified` · `image` (nullable) · `role` (ADMIN|SELLER|VIEWER, default: VIEWER) · `createdAt` · `updatedAt`

---

## Enums definidos

```typescript
// vehicle.entity.ts
Transmission: MANUAL='Manual' | AUTOMATIC='Automático'
VehicleStatus: AVAILABLE | RESERVED | SOLD
VehicleCondition: EXCELLENT='Excelente' | VERY_GOOD='Muy bueno' | GOOD='Bueno' | WITH_DETAILS='Con detalles'
FuelType: NAFTA='Nafta' | DIESEL='Diesel' | GNC='GNC' | HYBRID='Híbrido' | ELECTRIC='Eléctrico'

// consignment.entity.ts
CommissionType: FIXED | PERCENTAGE
ConsignmentStatus: ACTIVE | SOLD | WITHDRAWN

// sale.entity.ts
PaymentMethod: CASH | TRANSFER | TRADE | TRADE_DIFF | FINANCED
```

---

## Reglas de negocio importantes

- `list_price` debe ser mayor a `owner_price` (validar en VehicleCreator)
- `owner_price` **nunca** debe exponerse en endpoints públicos
- Máximo 3 imágenes por vehículo
- Flujo de estado de vehículo: `AVAILABLE → RESERVED → SOLD` (no se puede volver a AVAILABLE desde SOLD)
- Al crear una `Sale`: el vehículo pasa a `SOLD` y la consignación a `SOLD`
- `commission_earned` = si FIXED: `commission_value`; si PERCENTAGE: `sale_price * (commission_value / 100)`
- Una vez creada, la `Sale` es inmutable

---

## Testing (Jest)

**Alcance:** Solo Services. Controllers y DTOs no se testean.

**Patrón estándar de spec:**
```typescript
describe('NombreServicio', () => {
  let service: NombreServicio;
  let repository: jest.Mocked<Repository<Entidad>>;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      // solo los métodos que usa el servicio
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NombreServicio,
        { provide: getRepositoryToken(Entidad), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<NombreServicio>(NombreServicio);
    repository = module.get(getRepositoryToken(Entidad));
  });

  it('debe estar definido', () => { expect(service).toBeDefined(); });

  describe('run / findAll / findById', () => {
    it('caso happy path...', async () => { ... });
    it('debe lanzar XxxException cuando...', async () => { ... });
  });
});
```

**Reglas:**
- Mockear **todas** las dependencias externas
- Agrupar con `describe` por método
- Cubrir happy path + todos los casos de error
- Verificar con `expect().toHaveBeenCalledWith()`
- Máximo 500 líneas por archivo de test

---

## Bootstrap (main.ts)

- `bodyParser: false` → **requerido** para Better Auth (no cambiar)
- `/api/auth` bypass del JSON body parser
- Prefijo global: `/api`
- CORS habilitado para `http://localhost:3000` con `credentials: true`
- Puerto: `process.env.PORT ?? 3001`
- **Sin ValidationPipe global configurado** actualmente (validación vía DTOs)

---

## Base de datos

- `synchronize: true` cuando `NODE_ENV !== 'production'`
- `autoLoadEntities: true`
- SSL condicional por variable `DB_SSL=true`
- Variables: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
