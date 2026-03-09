import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { VehicleCreator } from './services/vehicle-creator.service';
import { VehicleFinder } from './services/vehicle-finder.service';
import { VehicleUpdater } from './services/vehicle-updater.service';
import { VehicleDeleter } from './services/vehicle-deleter.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(
    private readonly vehicleCreator: VehicleCreator,
    private readonly vehicleFinder: VehicleFinder,
    private readonly vehicleUpdater: VehicleUpdater,
    private readonly vehicleDeleter: VehicleDeleter,
  ) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleCreator.run(createVehicleDto);
  }

  @Get()
  @AllowAnonymous()
  findAll(@Query('brand') brand?: string) {
    return this.vehicleFinder.findAll(brand);
  }

  @Get(':id')
  @AllowAnonymous()
  findOne(@Param('id') id: string) {
    return this.vehicleFinder.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehicleUpdater.run(id, updateVehicleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehicleDeleter.run(id);
  }
}
