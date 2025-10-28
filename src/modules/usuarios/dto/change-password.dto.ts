import { IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'PasswordActual123',
    description: 'Contraseña actual del usuario',
  })
  @IsNotEmpty({ message: 'Debe ingresar la contraseña actual' })
  passwordActual: string;

  @ApiProperty({
    example: 'NuevaPassword456',
    description: 'Nueva contraseña (mínimo 6 caracteres, una mayúscula y un número)',
  })
  @IsNotEmpty({ message: 'La nueva contraseña no puede estar vacía' })
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  @MaxLength(100, { message: 'La nueva contraseña no debe exceder 100 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'La contraseña debe contener al menos una mayúscula y un número',
  })
  nuevaPassword: string;
}
