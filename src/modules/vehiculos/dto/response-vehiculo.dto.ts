import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { TipoVehiculo } from '../../../common/enums/tipo-vehiculo.enum';

export class ResponseVehiculoDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 2, required: false })
  @Expose()
  contratistaId?: number;

  @ApiProperty({ example: TipoVehiculo.AUTOMOVIL })
  @Expose()
  tipo: TipoVehiculo;

  @ApiProperty({ example: 'Toyota' })
  @Expose()
  marca: string;

  @ApiProperty({ example: 'Rojo' })
  @Expose()
  color: string;

  @ApiProperty({ example: 'ABC-1234' })
  @Expose()
  numeroPlaca: string;

  @ApiProperty({ example: true, required: false })
  @Expose()
  tieneLicencia?: boolean;

  @ApiProperty({ example: true, required: false })
  @Expose()
  dekraAlDia?: boolean;

  @ApiProperty({ example: true, required: false })
  @Expose()
  marchamoAlDia?: boolean;

  @ApiProperty({ example: true })
  @Expose()
  activo: boolean;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  @Expose()
  fechaCreacion: Date;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  @Expose()
  fechaActualizacion: Date;

  @ApiProperty({ example: null, required: false })
  @Expose()
  fechaEliminacion?: Date;
}
