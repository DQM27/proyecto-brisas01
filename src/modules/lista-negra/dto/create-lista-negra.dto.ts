import { IsEnum, IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { GrupoRiesgo, NivelRiesgo, CausaListaNegra } from '../../../common/enums/lista-negra.enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateListaNegraDto {
  @ApiProperty({ example: 1, description: 'ID del contratista al que se le asigna la lista negra' })
  @IsInt()
  @Min(1)
  contratistaId: number;

  @ApiProperty({
    example: GrupoRiesgo.ALTO,
    description: 'Grupo de riesgo del registro',
    enum: GrupoRiesgo,
  })
  @IsEnum(GrupoRiesgo)
  grupoRiesgo: GrupoRiesgo;

  @ApiProperty({
    example: CausaListaNegra.INCUMPLIMIENTO_CONTRATO,
    description: 'Causa de inclusión en la lista negra',
    enum: CausaListaNegra,
  })
  @IsEnum(CausaListaNegra)
  causa: CausaListaNegra;

  @ApiProperty({
    example: NivelRiesgo.ROJO,
    description: 'Nivel de riesgo asociado al registro',
    enum: NivelRiesgo,
  })
  @IsEnum(NivelRiesgo)
  nivelRiesgo: NivelRiesgo;

  @ApiProperty({
    example: 'Incumplimiento reiterado de normas',
    description: 'Observaciones adicionales',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}
