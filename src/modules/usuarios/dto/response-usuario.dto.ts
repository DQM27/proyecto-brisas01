import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseUsuarioDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Juan' })
  @Expose()
  primerNombre: string;

  @ApiProperty({ example: 'Perez' })
  @Expose()
  primerApellido: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'Admin', required: false })
  @Expose()
  rol?: string;

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
