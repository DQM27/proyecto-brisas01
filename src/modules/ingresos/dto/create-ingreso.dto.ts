import { IsInt, IsOptional, IsEnum, IsString } from 'class-validator';
import { TipoAutorizacion } from '../../../common/enums/tipo-autorizacion.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIngresoDto {
  @ApiPropertyOptional({ description: 'ID del contratista', type: Number })
  @IsOptional()
  @IsInt()
  contratistaId?: number;

  @ApiPropertyOptional({ description: 'ID del vehículo', type: Number })
  @IsOptional()
  @IsInt()
  vehiculoId?: number;

  @ApiPropertyOptional({ description: 'ID del gafete', type: Number })
  @IsOptional()
  @IsInt()
  gafeteId?: number;

  @ApiPropertyOptional({ description: 'ID del punto de entrada', type: Number })
  @IsOptional()
  @IsInt()
  puntoEntradaId?: number;

  @ApiPropertyOptional({ description: 'Tipo de autorización', enum: TipoAutorizacion })
  @IsOptional()
  @IsEnum(TipoAutorizacion)
  tipoAutorizacion?: TipoAutorizacion;

  @ApiPropertyOptional({ description: 'Observaciones adicionales', type: String, maxLength: 500 })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
