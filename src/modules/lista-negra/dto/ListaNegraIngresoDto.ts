import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { NivelRiesgo } from '../../../common/enums/lista-negra.enums';

export class SeguridadListaNegraDto {
  @ApiProperty({ example: false })
  @Expose()
  estaEnListaNegra: boolean;

  @ApiProperty({ example: NivelRiesgo.ROJO, required: false })
  @Expose()
  nivelRiesgo?: NivelRiesgo;
}
