import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Contratista } from '../../contratistas/entities/contratista.entity';
import { GrupoRiesgo, NivelRiesgo, CausaListaNegra } from '../../../common/enums/lista-negra.enums';

@Entity('lista_negra')
export class ListaNegra extends BaseEntity {
  @ManyToOne(() => Contratista, (contratista) => contratista.entradasListaNegra, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contratista_id' })
  contratista: Contratista;

  @Column({ type: 'enum', enum: GrupoRiesgo })
  grupoRiesgo: GrupoRiesgo;

  @Column({ type: 'enum', enum: CausaListaNegra })
  causa: CausaListaNegra;

  @Column({ type: 'enum', enum: NivelRiesgo })
  nivelRiesgo: NivelRiesgo;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ name: 'entrada_activa', default: true })
  entradaActiva: boolean;

  @CreateDateColumn({ name: 'fecha_inclusion' })
  fechaInclusion: Date;

  @Column({ name: 'fecha_retiro', type: 'timestamp', nullable: true })
  fechaRetiro?: Date;

  retirarDeLista(): void {
    this.entradaActiva = false;
    this.fechaRetiro = new Date();
  }
}
