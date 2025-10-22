import { IsInt, IsOptional, IsEnum, IsString } from 'class-validator';
import { TipoAutorizacion } from '../../../common/enums/tipo-autorizacion.enum';

export class CreateIngresoDto {
  @IsOptional()
  @IsInt()
  contratistaId?: number;

  @IsOptional()
  @IsInt()
  vehiculoId?: number;

  @IsOptional()
  @IsInt()
  gafeteId?: number;

  @IsOptional()
  @IsInt()
  puntoEntradaId?: number;

  @IsOptional()
  @IsEnum(TipoAutorizacion)
  tipoAutorizacion?: TipoAutorizacion;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
