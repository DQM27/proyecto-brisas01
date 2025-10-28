import { IsBoolean, IsEnum, IsInt, IsString, MaxLength, Min } from 'class-validator';
import { TipoVehiculo } from '../../../common/enums/tipo-vehiculo.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehiculoDto {
  @ApiProperty({ example: 1, description: 'ID del contratista al que pertenece el vehículo' })
  @IsInt({ message: 'El ID del contratista debe ser un número entero' })
  @Min(1, { message: 'El ID del contratista debe ser mayor que 0' })
  contratistaId: number;

  @ApiProperty({ enum: TipoVehiculo, example: TipoVehiculo.CAMIONETA })
  @IsEnum(TipoVehiculo, {
    message: 'El tipo de vehículo debe ser un valor válido del enum TipoVehiculo',
  })
  tipo: TipoVehiculo;

  @ApiProperty({ example: 'Toyota' })
  @IsString({ message: 'La marca debe ser una cadena de texto' })
  @MaxLength(100, { message: 'La marca no puede tener más de 100 caracteres' })
  marca: string;

  @ApiProperty({ example: 'Rojo' })
  @IsString({ message: 'El color debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El color no puede tener más de 50 caracteres' })
  color: string;

  @ApiProperty({ example: 'ABC-1234' })
  @IsString({ message: 'El número de placa debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El número de placa no puede tener más de 20 caracteres' })
  numeroPlaca: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean({ message: 'tieneLicencia debe ser un valor booleano' })
  tieneLicencia?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean({ message: 'dekraAlDia debe ser un valor booleano' })
  dekraAlDia?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean({ message: 'marchamoAlDia debe ser un valor booleano' })
  marchamoAlDia?: boolean;
}
