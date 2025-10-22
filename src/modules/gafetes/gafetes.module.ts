import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gafete } from './entities/gafete.entity';
import { HistorialGafete } from './entities/historial-gafete.entity';
import { Contratista } from '../contratistas/entities/contratista.entity';
import { GafetesService } from './gafetes.service';
import { GafetesController } from './gafetes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Gafete, HistorialGafete, Contratista])],
  controllers: [GafetesController],
  providers: [GafetesService],
  exports: [GafetesService],
})
export class GafetesModule {}
