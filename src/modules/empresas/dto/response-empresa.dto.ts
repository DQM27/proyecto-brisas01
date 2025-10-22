import { Expose } from 'class-transformer';

export class ResponseEmpresaDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;

  @Expose()
  direccion: string;

  @Expose()
  telefono: string;

  @Expose()
  fechaCreacion: Date;

  @Expose()
  fechaActualizacion: Date;
}
