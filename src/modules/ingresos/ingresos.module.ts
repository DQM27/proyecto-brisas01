import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngresosService } from './ingresos.service';
import { IngresosController } from './ingresos.controller';
import { Ingreso } from './entities/ingreso.entity';
import { Contratista } from '../contratistas/entities/contratista.entity';
import { Gafete } from '../gafetes/entities/gafete.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { GafetesModule } from '../gafetes/gafetes.module'; // ✅ importar módulo que provee el repository

@Module({
  imports: [
    TypeOrmModule.forFeature([Ingreso, Contratista, Gafete, Usuario]),
    GafetesModule, // ✅ permite inyectar HistorialGafeteRepository en IngresosService
  ],
  controllers: [IngresosController],
  providers: [IngresosService],
  exports: [IngresosService],
})
export class IngresosModule {}
