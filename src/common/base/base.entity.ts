import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * Entidad base para heredar campos comunes:
 * - ID autogenerado
 * - Fechas automáticas (creación/actualización)
 * - Eliminación lógica (soft delete con fecha_eliminacion)
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion', nullable: true })
  fechaEliminacion?: Date | null;

  /** Indica si el registro fue eliminado lógicamente */
  get estaEliminado(): boolean {
    return !!this.fechaEliminacion;
  }
}
