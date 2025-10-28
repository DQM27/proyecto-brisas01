import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';
import { RolUsuario } from '@common/enums/rol-usuario.enum';

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, {
    message: 'El primer nombre solo puede contener letras y espacios',
  })
  primerNombre: string;

  @IsOptional()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]*$/, {
    message: 'El segundo nombre solo puede contener letras y espacios',
  })
  segundoNombre?: string;

  @IsNotEmpty()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, {
    message: 'El primer apellido solo puede contener letras y espacios',
  })
  primerApellido: string;

  @IsOptional()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]*$/, {
    message: 'El segundo apellido solo puede contener letras y espacios',
  })
  segundoApellido?: string;

  @Matches(/^[0-9-]+$/, {
    message: 'La cédula solo puede contener números y guiones',
  })
  @MinLength(9, { message: 'La cédula debe tener al menos 9 caracteres' })
  @MaxLength(12, { message: 'La cédula debe tener como máximo 12 caracteres' })
  cedula: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @Matches(/^[0-9]{4}-[0-9]{4}$/, {
    message: 'El teléfono debe tener el formato 0000-0000',
  })
  @MinLength(9, { message: 'El teléfono debe tener 9 caracteres incluyendo el guion' })
  @MaxLength(9, { message: 'El teléfono debe tener 9 caracteres incluyendo el guion' })
  telefono?: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, {
    message: 'La contraseña debe incluir letras y números',
  })
  password: string;

  @IsOptional()
  @IsEnum(RolUsuario, {
    message: 'El rol debe ser ADMIN, SUPERVISOR, SEGURIDAD u OPERADOR',
  })
  rol?: RolUsuario;
}
