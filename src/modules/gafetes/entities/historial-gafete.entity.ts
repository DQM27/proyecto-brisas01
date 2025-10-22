import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { Gafete } from './gafete.entity';
import { Contratista } from '../../../modules/contratistas/entities/contratista.entity';
import { Ingreso } from '../../../modules/ingresos/entities/ingreso.entity';
import { EstadoDevolucionGafete } from '@common/enums/estado-devolucion-gafete.enum';

@Entity('historial_gafetes')
export class HistorialGafete {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Gafete, (gafete) => gafete.historial, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'gafete_id' })
  @Index('idx_historial_gafete')
  gafete: Gafete;

  @ManyToOne(() => Contratista, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'contratista_id' })
  @Index('idx_historial_contratista')
  contratista?: Contratista;

  @ManyToOne(() => Ingreso, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ingreso_id' })
  ingreso?: Ingreso;

  @CreateDateColumn({ name: 'fecha_asignacion' })
  fechaAsignacion: Date;

  @Column({ name: 'fecha_devolucion', type: 'timestamp', nullable: true })
  fechaDevolucion?: Date;

  @Column({
    name: 'estado_devolucion',
    type: 'simple-enum',
    enum: EstadoDevolucionGafete,
    nullable: true,
  })
  estadoDevolucion?: EstadoDevolucionGafete;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;
}
