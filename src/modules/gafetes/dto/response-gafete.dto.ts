import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { EstadoGafete } from '@common/enums/gafete-estado.enum';

export class ResponseGafeteDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'GF-001' })
  @Expose()
  codigo: string;

  @ApiProperty({ example: EstadoGafete.ACTIVO, required: false })
  @Expose()
  estado?: EstadoGafete;

  @ApiProperty({ example: 2, required: false })
  @Expose()
  contratistaId?: number;

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
