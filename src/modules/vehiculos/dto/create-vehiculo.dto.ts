import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { TipoVehiculo } from '../../../common/enums/tipo-vehiculo.enum';

export class CreateVehiculoDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  contratistaId?: number;

  @IsEnum(TipoVehiculo, {
    message: 'El tipo de vehículo debe ser un valor válido del enum TipoVehiculo',
  })
  tipo: TipoVehiculo;

  @IsString()
  @MaxLength(100)
  marca: string;

  @IsString()
  @MaxLength(50)
  color: string;

  @IsString()
  @MaxLength(20)
  numeroPlaca: string;

  @IsOptional()
  @IsBoolean()
  tieneLicencia?: boolean;

  @IsOptional()
  @IsBoolean()
  dekraAlDia?: boolean;

  @IsOptional()
  @IsBoolean()
  marchamoAlDia?: boolean;
}
