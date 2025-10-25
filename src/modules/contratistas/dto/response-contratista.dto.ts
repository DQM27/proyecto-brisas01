import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResponseContratistaDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Juan' })
  @Expose()
  primerNombre: string;

  @ApiProperty({ example: 'Carlos', required: false })
  @Expose()
  segundoNombre?: string;

  @ApiProperty({ example: 'Pérez' })
  @Expose()
  primerApellido: string;

  @ApiProperty({ example: 'Gómez', required: false })
  @Expose()
  segundoApellido?: string;

  @ApiProperty({ example: '123456789' })
  @Expose()
  cedula: string;

  @ApiProperty({ example: '8888-9999', required: false })
  @Expose()
  telefono?: string;

  @ApiProperty({ example: 2, required: false })
  @Expose()
  empresaId?: number;

  @ApiProperty({ example: '2025-10-20T00:00:00.000Z', required: false })
  @Expose()
  fechaVencimientoPraind?: string;

  @ApiProperty({ example: true, required: false })
  @Expose()
  activo?: boolean;

  @ApiProperty({ example: 'Notas adicionales', required: false })
  @Expose()
  notas?: string;

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
