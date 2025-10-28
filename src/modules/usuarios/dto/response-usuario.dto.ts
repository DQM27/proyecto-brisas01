import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RolUsuario } from '@common/enums/rol-usuario.enum';

export class ResponseUsuarioDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Juan' })
  @Expose()
  primerNombre: string;

  @ApiProperty({ example: 'Carlos', required: false })
  @Expose()
  segundoNombre?: string;

  @ApiProperty({ example: 'Perez' })
  @Expose()
  primerApellido: string;

  @ApiProperty({ example: 'González', required: false })
  @Expose()
  segundoApellido?: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: '1-0885-0126' })
  @Expose()
  cedula: string;

  @ApiProperty({ example: '7006-8596', required: false })
  @Expose()
  telefono?: string;

  @ApiProperty({
    example: RolUsuario.ADMIN,
    enum: RolUsuario,
  })
  @Expose()
  rol: RolUsuario;

  @ApiProperty({ example: true })
  @Expose()
  activo: boolean;

  @ApiProperty({ example: '2025-10-25T08:00:00.000Z' })
  @Expose()
  fechaCreacion: Date;

  @ApiProperty({ example: '2025-10-25T08:05:00.000Z' })
  @Expose()
  fechaActualizacion: Date;
}
