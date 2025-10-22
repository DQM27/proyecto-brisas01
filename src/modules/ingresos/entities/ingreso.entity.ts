import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Contratista } from '../../../modules/contratistas/entities/contratista.entity';
import { Vehiculo } from '../../../modules/vehiculos/entities/vehiculo.entity';
import { Gafete } from '../../../modules/gafetes/entities/gafete.entity';
import { PuntoAcceso } from '../../../modules/puntos-acceso/entities/punto-acceso.entity';
import { Usuario } from '../../../modules/usuarios/entities/usuario.entity';
import { TipoAutorizacion } from '@common/enums/tipo-autorizacion.enum';

@Entity('ingresos')
export class Ingreso extends BaseEntity {
  @ManyToOne(() => Contratista, (contratista) => contratista.ingresos, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'contratista_id' })
  @Index('idx_ingreso_contratista')
  contratista?: Contratista;

  @ManyToOne(() => Vehiculo, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'vehiculo_id' })
  vehiculo?: Vehiculo;

  @ManyToOne(() => Gafete, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'gafete_id' })
  gafete?: Gafete;

  @ManyToOne(() => PuntoAcceso, (punto) => punto.ingresosEntrada, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'punto_entrada_id' })
  puntoEntrada?: PuntoAcceso;

  @ManyToOne(() => PuntoAcceso, (punto) => punto.ingresosSalida, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'punto_salida_id' })
  puntoSalida?: PuntoAcceso;

  @Column({
    name: 'tipo_autorizacion',
    type: 'simple-enum',
    enum: TipoAutorizacion,
    nullable: true,
  })
  tipoAutorizacion?: TipoAutorizacion;

  @Column({ name: 'fecha_ingreso', type: 'timestamp', nullable: true })
  fechaIngreso?: Date;

  @Column({ name: 'fecha_salida', type: 'timestamp', nullable: true })
  fechaSalida?: Date;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'ingresado_por_id' })
  ingresadoPor?: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'sacado_por_id' })
  sacadoPor: Usuario | null;

  @Column({ name: 'dentro_fuera', type: 'boolean', default: true })
  dentroFuera: boolean;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;
}
