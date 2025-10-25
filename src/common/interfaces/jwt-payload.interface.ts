// src/common/interfaces/jwt-payload.interface.ts
import { RolUsuario } from '../enums/rol-usuario.enum';

export interface JwtPayload {
  sub: number; // id del usuario, opcional si no quieres exponerlo
  email: string;
  rol: RolUsuario;
  primerNombre: string;
  primerApellido: string;
}
