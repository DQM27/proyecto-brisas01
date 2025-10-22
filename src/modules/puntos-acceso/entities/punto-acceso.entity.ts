import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Ingreso } from '../../../modules/ingresos/entities/ingreso.entity';

@Entity('puntos_acceso')
export class PuntoAcceso extends BaseEntity {
  @Column({ length: 255 })
  @Index('idx_punto_nombre')
  nombre: string;

  @Column({ unique: true, length: 50 })
  @Index('idx_punto_codigo')
  codigo: string;

  @Column({ length: 255, nullable: true })
  ubicacion?: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Ingreso, (ingreso) => ingreso.puntoEntrada)
  ingresosEntrada: Ingreso[];

  @OneToMany(() => Ingreso, (ingreso) => ingreso.puntoSalida)
  ingresosSalida: Ingreso[];
}
