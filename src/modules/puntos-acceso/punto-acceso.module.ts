import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PuntoAcceso } from './entities/punto-acceso.entity';
import { PuntoAccesoService } from './punto-acceso.service';
import { PuntoAccesoController } from './punto-acceso.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PuntoAcceso])],
  controllers: [PuntoAccesoController],
  providers: [PuntoAccesoService],
  exports: [PuntoAccesoService],
})
export class PuntoAccesoModule {}
