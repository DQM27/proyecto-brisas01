import { ManyToOne, JoinColumn } from 'typeorm';
import { AbstractAuditEntity } from './abstract-audit.entity';
import { Usuario } from '../../modules/usuarios/entities/usuario.entity';

/**
 * BaseEntity con referencia opcional al usuario creador/modificador.
 * No usar eager loading para evitar joins automáticos.
 */
export abstract class BaseEntity extends AbstractAuditEntity {
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'creado_por_id' })
  creadoPor?: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'modificado_por_id' })
  modificadoPor?: Usuario;
}
