import { TipoAutorizacion } from '@common/enums/tipo-autorizacion.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

export class ResponseIngresoDto {
  @ApiProperty({ example: 1, description: 'ID del ingreso' })
  @Expose()
  id: number;

  // CONTRATISTA (mantienes tu @Transform original)
  @ApiProperty({
    example: {
      id: 10,
      nombreCompleto: 'Juan Carlos Pérez González',
      cedula: '123456789',
      primerNombre: 'Juan',
      primerApellido: 'Pérez',
      empresa: { id: 5, nombre: 'Constructora ABC S.A.' },
    },
  })
  @Expose()
  @Transform(({ obj }) => {
    if (!obj.contratista) return null;
    const c = obj.contratista;
    const nombreCompleto = [c.primerNombre, c.segundoNombre, c.primerApellido, c.segundoApellido]
      .filter(Boolean)
      .join(' ')
      .trim();
    return {
      id: c.id,
      nombreCompleto: nombreCompleto || `Contratista ${c.id}`,
      cedula: c.cedula,
      primerNombre: c.primerNombre,
      primerApellido: c.primerApellido,
      empresa: c.empresa ? { id: c.empresa.id, nombre: c.empresa.nombre } : null,
    };
  })
  contratista: {
    id: number;
    nombreCompleto: string;
    cedula: string;
    primerNombre: string;
    primerApellido: string;
    empresa: { id: number; nombre: string } | null;
  };

  @ApiPropertyOptional({ example: { id: 5, numeroPlaca: 'ABC123' } })
  @Expose()
  @Transform(({ obj }) =>
    obj.vehiculo ? { id: obj.vehiculo.id, numeroPlaca: obj.vehiculo.numeroPlaca } : null,
  )
  vehiculo?: { id: number; numeroPlaca: string } | null;

  @ApiPropertyOptional({ example: { id: 3, codigo: 'GAF-001', estado: 'ACTIVO' } })
  @Expose()
  @Transform(({ obj }) =>
    obj.gafete ? { id: obj.gafete.id, codigo: obj.gafete.codigo, estado: obj.gafete.estado } : null,
  )
  gafete?: { id: number; codigo: string; estado: string } | null;

  @ApiPropertyOptional({ example: { id: 1, nombre: 'Entrada Principal' } })
  @Expose()
  @Transform(({ obj }) =>
    obj.puntoEntrada ? { id: obj.puntoEntrada.id, nombre: obj.puntoEntrada.nombre } : null,
  )
  puntoEntrada?: { id: number; nombre: string } | null;

  @ApiPropertyOptional({ example: { id: 2, nombre: 'Salida Trasera' } })
  @Expose()
  @Transform(({ obj }) =>
    obj.puntoSalida ? { id: obj.puntoSalida.id, nombre: obj.puntoSalida.nombre } : null,
  )
  puntoSalida?: { id: number; nombre: string } | null;

  @ApiProperty({ example: TipoAutorizacion.AUTOMATICA, enum: TipoAutorizacion })
  @Expose()
  tipoAutorizacion: TipoAutorizacion;

  @ApiProperty({ example: '2025-10-28T08:00:00.000Z' })
  @Expose()
  @Type(() => Date)
  fechaIngreso: Date;

  @ApiPropertyOptional({ example: '2025-10-28T17:00:00.000Z' })
  @Expose()
  @Type(() => Date)
  fechaSalida?: Date;

  // INGRESADO POR - SIN @Transform, SE CONSTRUYE EN CONTROLADOR
  @ApiProperty({ example: { id: 1, nombreCompleto: 'Admin Principal' } })
  @Expose()
  ingresadoPor: {
    id: number;
    nombreCompleto: string;
  };

  // SACADO POR - SIN @Transform
  @ApiPropertyOptional({ example: { id: 1, nombreCompleto: 'Admin Principal' } })
  @Expose()
  sacadoPor?: {
    id: number;
    nombreCompleto: string;
  } | null;

  @ApiProperty({ example: true })
  @Expose()
  dentroFuera: boolean;

  @ApiPropertyOptional({ example: 'Ingreso autorizado por gerencia' })
  @Expose()
  observaciones?: string;

  @ApiProperty({ example: '2025-10-28T08:00:00.000Z' })
  @Expose()
  @Type(() => Date)
  fechaCreacion: Date;

  @ApiProperty({ example: '2025-10-28T08:05:00.000Z' })
  @Expose()
  @Type(() => Date)
  fechaActualizacion: Date;

  @ApiPropertyOptional({ example: null })
  @Expose()
  @Type(() => Date)
  fechaEliminacion?: Date | null;

  @ApiPropertyOptional({ example: '9h 15m 30s' })
  @Expose()
  @Transform(({ obj }) => {
    if (!obj.fechaIngreso) return null;
    const fin = obj.fechaSalida ?? new Date();
    const diffMs = fin.getTime() - obj.fechaIngreso.getTime();
    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${horas}h ${minutos}m ${segundos}s`;
  })
  duracion?: string;
}
