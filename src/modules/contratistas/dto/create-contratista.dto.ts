import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsNumber,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContratistaDto {
  @ApiProperty({ example: 'Juan' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  primerNombre: string;

  @ApiProperty({ example: 'Carlos', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  segundoNombre?: string;

  @ApiProperty({ example: 'Pérez' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  primerApellido: string;

  @ApiProperty({ example: 'Gómez', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  segundoApellido?: string;

  @ApiProperty({ example: '123456789' })
  @IsNotEmpty()
  @IsString()
  @Length(5, 20)
  cedula: string;

  @ApiProperty({ example: '8888-9999', required: false })
  @IsOptional()
  @IsString()
  @Length(5, 20)
  telefono?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  empresaId?: number;

  @ApiProperty({ example: '2025-10-20T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  fechaVencimientoPraind?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiProperty({ example: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  notas?: string;
}
