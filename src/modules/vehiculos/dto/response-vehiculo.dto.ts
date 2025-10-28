import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { TipoVehiculo } from '../../../common/enums/tipo-vehiculo.enum';

export class ResponseVehiculoDto {
  @ApiProperty({ example: 1, description: 'ID del vehículo' })
  @Expose()
  id: number;

  @ApiProperty({ example: 1, description: 'ID del contratista al que pertenece el vehículo' })
  @Expose()
  contratistaId: number;

  @ApiProperty({ enum: TipoVehiculo, example: TipoVehiculo.AUTOMOVIL })
  @Expose()
  tipo: TipoVehiculo;

  @ApiProperty({ example: 'Toyota', description: 'Marca del vehículo' })
  @Expose()
  marca: string;

  @ApiProperty({ example: 'Rojo', description: 'Color del vehículo' })
  @Expose()
  color: string;

  @ApiProperty({ example: 'ABC-1234', description: 'Número de placa' })
  @Expose()
  numeroPlaca: string;

  @ApiProperty({ example: true, description: 'Indica si tiene licencia' })
  @Expose()
  tieneLicencia?: boolean;

  @ApiProperty({ example: true, description: 'Indica si Dekra está al día' })
  @Expose()
  dekraAlDia?: boolean;

  @ApiProperty({ example: true, description: 'Indica si marchamo está al día' })
  @Expose()
  marchamoAlDia?: boolean;

  @ApiProperty({ example: true, description: 'Indica si el vehículo está activo' })
  @Expose()
  activo: boolean;

  @ApiProperty({
    example: '2025-01-01T12:00:00.000Z',
    description: 'Fecha de creación del registro',
  })
  @Expose()
  fechaCreacion: Date;

  @ApiProperty({
    example: '2025-01-01T12:00:00.000Z',
    description: 'Fecha de última actualización',
  })
  @Expose()
  fechaActualizacion: Date;

  @ApiProperty({
    example: null,
    required: false,
    description: 'Fecha de eliminación (si fue soft deleted)',
  })
  @Expose()
  fechaEliminacion?: Date;
}
