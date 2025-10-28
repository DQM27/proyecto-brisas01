import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngresosService } from './ingresos.service';
import { IngresosController } from './ingresos.controller';
import { IngresoValidationService } from './ingreso-validation.service';
import { Ingreso } from './entities/ingreso.entity';
import { Contratista } from '../contratistas/entities/contratista.entity';
import { Gafete } from '../gafetes/entities/gafete.entity';
import { HistorialGafete } from '../gafetes/entities/historial-gafete.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

/**
 * Módulo de gestión de ingresos y salidas de contratistas.
 *
 * @remarks
 * Este módulo proporciona toda la funcionalidad necesaria para:
 * - Registrar ingresos de contratistas
 * - Registrar salidas de contratistas
 * - Gestionar el historial de gafetes
 * - Validar reglas de negocio (lista negra, Praind, etc.)
 *
 * Servicios principales:
 * - IngresosService: Orquestación de operaciones
 * - IngresoValidationService: Validaciones de negocio
 */
@Module({
  imports: [TypeOrmModule.forFeature([Ingreso, Contratista, Gafete, HistorialGafete, Usuario])],
  controllers: [IngresosController],
  providers: [IngresosService, IngresoValidationService],
  exports: [IngresosService, IngresoValidationService],
})
export class IngresosModule {}
