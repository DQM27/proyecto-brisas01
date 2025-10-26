import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsOptional, MinLength, IsEnum } from 'class-validator';
import { RolUsuario } from '@common/enums/rol-usuario.enum';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @IsOptional()
  @IsEnum(RolUsuario, { message: 'El rol debe ser ADMIN, SUPERVISOR, SEGURIDAD u OPERADOR' })
  rol?: RolUsuario;
}
