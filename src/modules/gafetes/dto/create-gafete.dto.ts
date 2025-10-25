import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { EstadoGafete } from '@common/enums/gafete-estado.enum';

export class CreateGafeteDto {
  @IsNotEmpty()
  @IsString()
  codigo: string;

  @IsOptional()
  @IsString()
  estado?: EstadoGafete; // ACTIVO | INACTIVO | PERDIDO

  @IsOptional()
  @IsInt()
  contratistaId?: number;
}
