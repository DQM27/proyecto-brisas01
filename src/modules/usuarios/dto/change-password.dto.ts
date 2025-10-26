import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'PasswordActual123' })
  @IsNotEmpty()
  passwordActual: string;

  @ApiProperty({ example: 'NuevaPassword456', description: 'Mínimo 6 caracteres' })
  @IsNotEmpty()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  nuevaPassword: string;
}
