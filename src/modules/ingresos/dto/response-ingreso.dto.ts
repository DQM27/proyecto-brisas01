import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { TipoAutorizacion } from '@common/enums/tipo-autorizacion.enum';

/**
 * DTO de respuesta para operaciones de ingreso.
 *
 * @remarks
 * Este DTO mapea correctamente la estructura de la entidad Ingreso,
 * incluyendo relaciones anidadas cuando están cargadas.
 */
export class ResponseIngresoDto {
  @ApiProperty({ example: 1, description: 'ID del ingreso' })
  @Expose()
  id: number;

  @ApiProperty({
    example: { id: 10, nombre: 'Juan Pérez' },
    description: 'Datos del contratista',
  })
  @Expose()
  @Transform(({ obj }) =>
    obj.contratista
      ? {
          id: obj.contratista.id,
          nombre: obj.contratista.nombre,
          identificacion: obj.contratista.identificacion,
        }
      : null,
  )
  contratista: {
    id: number;
    nombre: string;
    identificacion: string;
  };

  @ApiPropertyOptional({
    example: { id: 5, placa: 'ABC123' },
    description: 'Datos del vehículo',
  })
  @Expose()
  @Transform(({ obj }) =>
    obj.vehiculo
      ? {
          id: obj.vehiculo.id,
          placa: obj.vehiculo.placa,
        }
      : null,
  )
  vehiculo?: {
    id: number;
    placa: string;
  } | null;

  @ApiPropertyOptional({
    example: { id: 3, codigo: 'GAF-001' },
    description: 'Datos del gafete asignado',
  })
  @Expose()
  @Transform(({ obj }) =>
    obj.gafete
      ? {
          id: obj.gafete.id,
          codigo: obj.gafete.codigo,
          estado: obj.gafete.estado,
        }
      : null,
  )
  gafete?: {
    id: number;
    codigo: string;
    estado: string;
  } | null;

  @ApiPropertyOptional({
    example: { id: 1, nombre: 'Entrada Principal' },
    description: 'Punto de entrada',
  })
  @Expose()
  @Transform(({ obj }) =>
    obj.puntoEntrada
      ? {
          id: obj.puntoEntrada.id,
          nombre: obj.puntoEntrada.nombre,
        }
      : null,
  )
  puntoEntrada?: {
    id: number;
    nombre: string;
  } | null;

  @ApiPropertyOptional({
    example: { id: 2, nombre: 'Salida Trasera' },
    description: 'Punto de salida',
  })
  @Expose()
  @Transform(({ obj }) =>
    obj.puntoSalida
      ? {
          id: obj.puntoSalida.id,
          nombre: obj.puntoSalida.nombre,
        }
      : null,
  )
  puntoSalida?: {
    id: number;
    nombre: string;
  } | null;

  @ApiProperty({
    example: TipoAutorizacion.AUTOMATICA,
    enum: TipoAutorizacion,
    description: 'Tipo de autorización del ingreso',
  })
  @Expose()
  tipoAutorizacion: TipoAutorizacion;

  @ApiProperty({
    example: '2025-10-28T08:00:00.000Z',
    description: 'Fecha y hora de ingreso',
  })
  @Expose()
  @Type(() => Date)
  fechaIngreso: Date;

  @ApiPropertyOptional({
    example: '2025-10-28T17:00:00.000Z',
    description: 'Fecha y hora de salida',
  })
  @Expose()
  @Type(() => Date)
  fechaSalida?: Date;

  @ApiProperty({
    example: { id: 5, nombreCompleto: 'María García' },
    description: 'Usuario que registró el ingreso',
  })
  @Expose()
  @Transform(({ obj }) =>
    obj.ingresadoPor
      ? {
          id: obj.ingresadoPor.id,
          nombreCompleto: obj.ingresadoPor.nombreCompleto,
        }
      : null,
  )
  ingresadoPor: {
    id: number;
    nombreCompleto: string;
  };

  @ApiPropertyOptional({
    example: { id: 7, nombreCompleto: 'Carlos López' },
    description: 'Usuario que registró la salida',
  })
  @Expose()
  @Transform(({ obj }) =>
    obj.sacadoPor
      ? {
          id: obj.sacadoPor.id,
          nombreCompleto: obj.sacadoPor.nombreCompleto,
        }
      : null,
  )
  sacadoPor?: {
    id: number;
    nombreCompleto: string;
  } | null;

  @ApiProperty({
    example: true,
    description: 'Indica si el contratista está actualmente dentro (true) o ya salió (false)',
  })
  @Expose()
  dentroFuera: boolean;

  @ApiPropertyOptional({
    example: 'Ingreso autorizado por gerencia',
    description: 'Observaciones adicionales',
  })
  @Expose()
  observaciones?: string;

  @ApiProperty({
    example: '2025-10-28T08:00:00.000Z',
    description: 'Fecha de creación del registro',
  })
  @Expose()
  @Type(() => Date)
  fechaCreacion: Date;

  @ApiProperty({
    example: '2025-10-28T08:05:00.000Z',
    description: 'Fecha de última actualización del registro',
  })
  @Expose()
  @Type(() => Date)
  fechaActualizacion: Date;

  @ApiPropertyOptional({
    example: null,
    description: 'Fecha de eliminación lógica (soft delete)',
  })
  @Expose()
  @Type(() => Date)
  fechaEliminacion?: Date | null;

  /**
   * Campo calculado: duración de la estancia.
   */
  @ApiPropertyOptional({
    example: '9h 15m 30s',
    description: 'Duración calculada de la estancia',
  })
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
