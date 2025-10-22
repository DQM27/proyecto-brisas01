// src/modules/usuarios/dto/response-usuario.dto.ts
import { Exclude, Expose } from 'class-transformer';

@Exclude() // Oculta todos los campos por defecto
export class ResponseUsuarioDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;

  @Expose()
  apellido: string;

  @Expose()
  email: string;

  @Expose()
  rol: string;

  @Expose()
  fechaCreacion: Date;

  @Expose()
  fechaActualizacion: Date;
}
