import { Owner } from 'src/owners/entities/owner.entity';

export const OWNER_SEED_DATA: Partial<Owner>[] = [
  {
    fullName: 'Juan Pérez',
    phone: '+5491112345678',
    email: 'juan.perez@email.com',
    observation: 'Cliente frecuente, prefiere contacto por WhatsApp.',
  },
  {
    fullName: 'María González',
    phone: '+5491155667788',
    email: 'maria.gonzalez@email.com',
    observation: undefined,
  },
  {
    fullName: 'Carlos Rodríguez',
    phone: '+5491199887766',
    email: undefined,
    observation: 'Solo responde llamadas, no usa email.',
  },
  {
    fullName: 'Ana Martínez',
    phone: '+5491122334455',
    email: 'ana.martinez@email.com',
    observation: 'Interesada en permuta por SUV.',
  },
  {
    fullName: 'Roberto Fernández',
    phone: '+5491166554433',
    email: 'roberto.f@email.com',
    observation: 'Urgente por vender, precio flexible.',
  },
];