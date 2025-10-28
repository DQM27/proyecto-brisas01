import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateIngresoDto } from './create-ingreso.dto';

/**
 * DTO para actualización parcial de un ingreso.
 *
 * @remarks
 * Por seguridad, solo permite actualizar campos específicos.
 * Los campos críticos como contratista, fechas y estado no pueden modificarse.
 *
 * Campos actualizables:
 * - observaciones
 * - tipoAutorizacion
 *
 * Campos NO actualizables:
 * - contratistaId (el contratista no puede cambiar)
 * - gafeteId (el gafete se asigna al ingreso)
 * - vehiculoId (el vehículo se asigna al ingreso)
 * - puntoEntradaId (el punto de entrada se registra al ingreso)
 */
export class UpdateIngresoDto extends PartialType(
  OmitType(CreateIngresoDto, [
    'contratistaId',
    'gafeteId',
    'vehiculoId',
    'puntoEntradaId',
  ] as const),
) {}
