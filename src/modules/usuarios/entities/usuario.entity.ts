import { Entity, Column, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '@common/base/base.entity';
import { RolUsuario } from '@common/enums/rol-usuario.enum';

@Entity('usuarios')
export class Usuario extends BaseEntity {
  @Column({ name: 'primer_nombre', length: 100 })
  primerNombre: string;

  @Column({ name: 'segundo_nombre', length: 100, nullable: true })
  segundoNombre?: string;

  @Column({ name: 'primer_apellido', length: 100 })
  primerApellido: string;

  @Column({ name: 'segundo_apellido', length: 100, nullable: true })
  segundoApellido?: string;

  @Column({ unique: true, length: 20 })
  @Index('idx_usuario_cedula')
  cedula: string;

  @Column({ unique: true, length: 255 })
  @Index('idx_usuario_email')
  email: string;

  @Column({ length: 20, nullable: true })
  telefono?: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'simple-enum',
    enum: RolUsuario,
    default: RolUsuario.OPERADOR,
  })
  rol: RolUsuario;

  @Column({ default: true })
  activo: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  obtenerNombreCompleto(): string {
    return `${this.primerNombre} ${this.segundoNombre || ''} ${this.primerApellido} ${this.segundoApellido || ''}`
      .replace(/\s+/g, ' ')
      .trim();
  }
}
