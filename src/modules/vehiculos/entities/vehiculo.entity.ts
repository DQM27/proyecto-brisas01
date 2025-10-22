import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Contratista } from '../../../modules/contratistas/entities/contratista.entity';
import { TipoVehiculo } from '../../../common/enums/tipo-vehiculo.enum';

@Entity('vehiculos')
export class Vehiculo extends BaseEntity {
  @ManyToOne(() => Contratista, (contratista) => contratista.vehiculos, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'contratista_id' })
  @Index('idx_vehiculo_contratista')
  contratista?: Contratista;

  @Column({
    type: 'simple-enum',
    enum: TipoVehiculo,
  })
  tipo: TipoVehiculo;

  @Column({ length: 100 })
  marca: string;

  @Column({ length: 50 })
  color: string;

  @Column({ name: 'numero_placa', unique: true, length: 20 })
  @Index('idx_vehiculo_placa')
  numeroPlaca: string;

  @Column({ name: 'tiene_licencia', default: false })
  tieneLicencia: boolean;

  @Column({ name: 'dekra_al_dia', default: false })
  dekraAlDia: boolean;

  @Column({ name: 'marchamo_al_dia', default: false })
  marchamoAlDia: boolean;
}
