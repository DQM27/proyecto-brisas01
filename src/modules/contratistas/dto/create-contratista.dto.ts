import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Length,
  IsPositive,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContratistaDto {
  @ApiProperty({ example: 'Juan' })
  @IsNotEmpty({ message: 'El primer nombre es obligatorio' })
  @IsString({ message: 'El primer nombre debe ser una cadena de texto' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, {
    message: 'El primer nombre solo puede contener letras y espacios',
  })
  @Length(2, 100, {
    message: 'El primer nombre debe tener entre 2 y 100 caracteres',
  })
  primerNombre: string;

  @ApiProperty({ example: 'Carlos', required: false })
  @IsOptional()
  @IsString({ message: 'El segundo nombre debe ser una cadena de texto' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]*$/, {
    message: 'El segundo nombre solo puede contener letras y espacios',
  })
  @Length(2, 100, {
    message: 'El segundo nombre debe tener entre 2 y 100 caracteres',
  })
  segundoNombre?: string;

  @ApiProperty({ example: 'Pérez' })
  @IsNotEmpty({ message: 'El primer apellido es obligatorio' })
  @IsString({ message: 'El primer apellido debe ser una cadena de texto' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, {
    message: 'El primer apellido solo puede contener letras y espacios',
  })
  @Length(2, 100, {
    message: 'El primer apellido debe tener entre 2 y 100 caracteres',
  })
  primerApellido: string;

  @ApiProperty({ example: 'Gómez', required: false })
  @IsOptional()
  @IsString({ message: 'El segundo apellido debe ser una cadena de texto' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]*$/, {
    message: 'El segundo apellido solo puede contener letras y espacios',
  })
  @Length(2, 100, {
    message: 'El segundo apellido debe tener entre 2 y 100 caracteres',
  })
  segundoApellido?: string;

  @ApiProperty({ example: '123456789' })
  @IsNotEmpty({ message: 'La cédula es obligatoria' })
  @Matches(/^[0-9]+$/, {
    message: 'La cédula solo puede contener números',
  })
  @Length(9, 12, {
    message: 'La cédula debe tener entre 9 y 12 caracteres (incluyendo guiones si aplica)',
  })
  cedula: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID de la empresa es obligatorio' })
  @IsPositive({ message: 'El ID de la empresa debe ser un número entero positivo' })
  empresaId: number;

  @ApiProperty({ example: '2025-10-20', required: false })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de vencimiento debe ser una fecha ISO válida (YYYY-MM-DD)' },
  )
  fechaVencimientoPraind?: string;
}
