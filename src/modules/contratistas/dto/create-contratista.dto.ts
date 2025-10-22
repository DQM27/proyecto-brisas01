import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsNumber,
  Length,
} from 'class-validator';

export class CreateContratistaDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  primerNombre: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  segundoNombre?: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  primerApellido: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  segundoApellido?: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 20)
  cedula: string;

  @IsOptional()
  @IsString()
  @Length(5, 20)
  telefono?: string;

  @IsOptional()
  @IsNumber()
  empresaId?: number;

  @IsOptional()
  @IsDateString()
  fechaVencimientoPraind?: string; // se envía en formato ISO (ej: '2025-10-20')

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  notas?: string;
}
