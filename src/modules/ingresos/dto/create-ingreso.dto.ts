import { IsInt, IsOptional, IsEnum, IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { TipoAutorizacion } from '../../../common/enums/tipo-autorizacion.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO para registrar un nuevo ingreso de contratista.
 *
 * @remarks
 * El único campo obligatorio es `contratistaId`. Los demás campos son opcionales
 * según el tipo de ingreso (con/sin vehículo, con/sin gafete, etc.).
 */
export class CreateIngresoDto {
  @ApiProperty({
    description: 'ID del contratista que ingresa',
    type: Number,
    example: 123,
  })
  @IsNotEmpty({ message: 'El ID del contratista es obligatorio' })
  @IsInt({ message: 'El ID del contratista debe ser un número entero' })
  @Type(() => Number)
  contratistaId: number;

  @ApiPropertyOptional({
    description: 'ID del vehículo con el que ingresa',
    type: Number,
    example: 45,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del vehículo debe ser un número entero' })
  @Type(() => Number)
  vehiculoId?: number;

  @ApiPropertyOptional({
    description: 'ID del gafete asignado',
    type: Number,
    example: 78,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del gafete debe ser un número entero' })
  @Type(() => Number)
  gafeteId?: number;

  @ApiPropertyOptional({
    description: 'ID del punto de entrada utilizado',
    type: Number,
    example: 2,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del punto de entrada debe ser un número entero' })
  @Type(() => Number)
  puntoEntradaId?: number;

  @ApiPropertyOptional({
    description: 'Tipo de autorización del ingreso',
    enum: TipoAutorizacion,
    example: TipoAutorizacion.AUTOMATICA,
    default: TipoAutorizacion.AUTOMATICA,
  })
  @IsOptional()
  @IsEnum(TipoAutorizacion, {
    message: 'El tipo de autorización debe ser uno de los valores permitidos',
  })
  tipoAutorizacion?: TipoAutorizacion;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales sobre el ingreso',
    type: String,
    maxLength: 500,
    example: 'Ingreso para mantenimiento de aire acondicionado',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  @MaxLength(500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
  observaciones?: string;
}
