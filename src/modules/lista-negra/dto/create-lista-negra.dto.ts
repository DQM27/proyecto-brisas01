import { IsEnum, IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { GrupoRiesgo, NivelRiesgo, CausaListaNegra } from '../enums/lista-negra.enums';

export class CreateListaNegraDto {
  @IsInt()
  @Min(1)
  contratistaId: number;

  @IsEnum(GrupoRiesgo)
  grupoRiesgo: GrupoRiesgo;

  @IsEnum(CausaListaNegra)
  causa: CausaListaNegra;

  @IsEnum(NivelRiesgo)
  nivelRiesgo: NivelRiesgo;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}
