import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entidad: string;

  @Column()
  entidadId: number;

  @Column()
  accion: string; // CREATE | UPDATE | SOFT_DELETE | RESTORE | LOGIN | etc.

  @Column({ type: 'json', nullable: true })
  datosPrevios?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  datosNuevos?: Record<string, any>;

  @Column({ nullable: true })
  usuarioId?: number;

  @CreateDateColumn()
  fecha: Date;
}
