import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OwnersSeeder } from './database/seeders/owners.seeder';
import { VehiclesSeeder } from './database/seeders/vehicles.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Ejecutar Owners
    const ownersSeeder = app.get(OwnersSeeder);
    const ownersCount = await ownersSeeder.run();
    console.log(`Owners: ${ownersCount} creados.`);

    // Ejecutar Vehículos
    const vehiclesSeeder = app.get(VehiclesSeeder);
    const vehiclesCount = await vehiclesSeeder.run();
    console.log(`Vehículos: ${vehiclesCount} creados.`);
  } catch (error) {
    console.error('Error ejecutando seed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
