import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { GrupoRiesgo, NivelRiesgo, CausaListaNegra } from '../../../common/enums/lista-negra.enums';

export class ResponseListaNegraDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 2 })
  @Expose()
  contratistaId: number;

  @ApiProperty({ example: GrupoRiesgo.ALTO })
  @Expose()
  grupoRiesgo: GrupoRiesgo;

  @ApiProperty({ example: CausaListaNegra.INCUMPLIMIENTO_CONTRATO })
  @Expose()
  causa: CausaListaNegra;

  @ApiProperty({ example: NivelRiesgo.ROJO })
  @Expose()
  nivelRiesgo: NivelRiesgo;

  @ApiProperty({ example: 'Observaciones adicionales', required: false })
  @Expose()
  observaciones?: string;

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
