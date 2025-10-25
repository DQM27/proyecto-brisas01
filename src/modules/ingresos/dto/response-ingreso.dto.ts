import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResponseIngresoDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 10 })
  @Expose()
  contratistaId: number;

  @ApiProperty({ example: '2025-10-25T08:00:00.000Z' })
  @Expose()
  fechaIngreso: Date;

  @ApiProperty({ example: '2025-10-25T17:00:00.000Z', required: false })
  @Expose()
  fechaSalida?: Date;

  @ApiProperty({ example: 5 })
  @Expose()
  usuarioRegistroId: number;

  @ApiProperty({ example: true })
  @Expose()
  activo: boolean;

  @ApiProperty({ example: '2025-10-25T08:00:00.000Z' })
  @Expose()
  fechaCreacion: Date;

  @ApiProperty({ example: '2025-10-25T08:05:00.000Z' })
  @Expose()
  fechaActualizacion: Date;

  @ApiProperty({ example: null, required: false })
  @Expose()
  fechaEliminacion?: Date;
}
