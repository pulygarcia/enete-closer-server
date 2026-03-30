import { Owner } from "src/owners/entities/owner.entity";
import { Transmission, Vehicle } from "src/vehicles/entities/vehicle.entity";


export const VEHICLE_SEED_DATA: Partial<Vehicle>[] = [
  {
    brand: 'Peugeot',
    model: '208 Active',
    plate: 'afx129',
    year: 2026,
    transmission: Transmission.MANUAL,
    km: 14000,
    owner_price: 1400000,
    list_price: 1550000,
    accepts_trade: true,
    images: [
      'https://cdn.peugeot.com.pe/image/1/208-front.jpg'
    ],
  },
  {
    brand: 'Renault',
    model: 'Sandero Stepway',
    plate: 'afx121',
    year: 2026,
    transmission: Transmission.MANUAL,
    km: 14000,
    owner_price: 1200000,
    list_price: 1300000,
    accepts_trade: false,
    images: [
      'https://cdn.renault.com.ar/sandero-stepway.jpg'
    ],
  },
  {
    brand: 'Fiat',
    model: 'Cronos Drive',
    plate: 'afx119',
    year: 2026,
    transmission: Transmission.MANUAL,
    km: 14000,
    owner_price: 1100000,
    list_price: 1250000,
    accepts_trade: true,
    images: [
      'https://cdn.fiat.com.ar/cronos-drive.jpg'
    ],
  },
  {
    brand: 'Fiat',
    model: 'Cronos Drive',
    plate: 'afx1229',
    year: 2026,
    transmission: Transmission.MANUAL,
    km: 14000,
    owner_price: 1100000,
    list_price: 1250000,
    accepts_trade: true,
    images: [
      'https://cdn.fiat.com.ar/cronos-drive.jpg'
    ],
  },
  {
    brand: 'Fiat',
    model: 'Cronos Drive',
    plate: 'af2x129',
    year: 2026,
    transmission: Transmission.MANUAL,
    km: 14000,
    owner_price: 1100000,
    list_price: 1250000,
    accepts_trade: true,
    images: [
      'https://cdn.fiat.com.ar/cronos-drive.jpg'
    ],
  }
];