import { IsBoolean, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreatePuntoAccesoDto {
  @IsString()
  @Length(3, 255)
  nombre: string;

  @IsString()
  @Length(2, 50)
  codigo: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ubicacion?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;
}
