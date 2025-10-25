// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../enums/rol-usuario.enum';

export const Roles = (...roles: RolUsuario[]) => SetMetadata('roles', roles);
