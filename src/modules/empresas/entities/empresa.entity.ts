import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Contratista } from '../../../modules/contratistas/entities/contratista.entity';

@Entity('empresas')
export class Empresa extends BaseEntity {
  @Column({ unique: true, length: 255 })
  @Index('idx_empresa_nombre')
  nombre: string;

  @OneToMany(() => Contratista, (contratista) => contratista.empresa)
  contratistas: Contratista[];
}
