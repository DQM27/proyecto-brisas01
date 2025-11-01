import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Empresa } from '../../../modules/empresas/entities/empresa.entity';
import { Gafete } from '../../../modules/gafetes/entities/gafete.entity';
import { Ingreso } from '../../../modules/ingresos/entities/ingreso.entity';
import { ListaNegra } from '../../../modules/lista-negra/entities/lista-negra.entity';
import { Vehiculo } from '../../../modules/vehiculos/entities/vehiculo.entity';

@Entity('contratistas')
export class Contratista extends BaseEntity {
  @Column({ name: 'primer_nombre', length: 100 })
  @Index('idx_contratista_primer_nombre')
  primerNombre: string;

  @Column({ name: 'segundo_nombre', length: 100, nullable: true })
  segundoNombre?: string;

  @Column({ name: 'primer_apellido', length: 100 })
  @Index('idx_contratista_primer_apellido')
  primerApellido: string;

  @Column({ name: 'segundo_apellido', length: 100, nullable: true })
  segundoApellido?: string;

  @Column({ unique: true, length: 20 })
  @Index('idx_contratista_cedula')
  cedula: string;

  @Column({ length: 20, nullable: true })
  telefono?: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.contratistas, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'empresa_id' })
  empresa?: Empresa;

  @Column({ name: 'fecha_vencimiento_praind', type: 'date', nullable: true })
  fechaVencimientoPraind?: Date;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'text', nullable: true })
  notas?: string;

  @OneToMany(() => Vehiculo, (vehiculo) => vehiculo.contratista)
  vehiculos: Vehiculo[];

  @OneToMany(() => Ingreso, (ingreso) => ingreso.contratista)
  ingresos: Ingreso[];

  @OneToMany(() => ListaNegra, (ln) => ln.contratista)
  entradasListaNegra: ListaNegra[];

  @OneToMany(() => Gafete, (gafete) => gafete.contratista)
  gafetes: Gafete[];

  obtenerNombreCompleto(): string {
    return [this.primerNombre, this.segundoNombre, this.primerApellido, this.segundoApellido]
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  estaEnListaNegra(): boolean {
    return this.entradasListaNegra?.some((entrada) => entrada.entradaActiva) || false;
  }

  tienePraindVencido(): boolean {
    if (!this.fechaVencimientoPraind) return true;
    const hoy = new Date();
    const venc = new Date(this.fechaVencimientoPraind);
    return hoy.setHours(0, 0, 0, 0) > venc.setHours(0, 0, 0, 0);
  }
}
