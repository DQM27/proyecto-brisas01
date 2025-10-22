import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { HistorialGafete } from './historial-gafete.entity';
import { TipoGafete } from '@common/enums/gafete-tipo.enum';
import { EstadoGafete } from '@common/enums/gafete-estado.enum';
import { Contratista } from '../../contratistas/entities/contratista.entity';

@Entity('gafetes')
export class Gafete {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TipoGafete })
  tipo: TipoGafete;

  @Column({ type: 'enum', enum: EstadoGafete, default: EstadoGafete.ACTIVO })
  estado: EstadoGafete;

  @Column({ unique: true })
  codigo: string;

  @Column({ nullable: true })
  descripcion?: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion', nullable: true })
  fechaEliminacion?: Date;

  // ✅ Relación con Contratista (clave para eliminar el error)
  @ManyToOne(() => Contratista, (contratista) => contratista.gafetes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'contratista_id' })
  contratista?: Contratista;

  // Historial del gafete
  @OneToMany(() => HistorialGafete, (historial) => historial.gafete)
  historial: HistorialGafete[];
}
