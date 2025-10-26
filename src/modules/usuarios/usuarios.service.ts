import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RolUsuario } from '@common/enums/rol-usuario.enum';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    const rol = dto.rol ?? RolUsuario.OPERADOR;

    const usuario = this.usuarioRepo.create({
      primerNombre: dto.primerNombre,
      segundoNombre: dto.segundoNombre,
      primerApellido: dto.primerApellido,
      segundoApellido: dto.segundoApellido,
      cedula: dto.cedula,
      email: dto.email,
      telefono: dto.telefono,
      password: dto.password,
      rol,
    });

    return this.usuarioRepo.save(usuario);
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepo.find({ where: { fechaEliminacion: IsNull() } });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id, fechaEliminacion: IsNull() },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: { email, fechaEliminacion: IsNull() },
    });
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    Object.assign(usuario, dto);
    return this.usuarioRepo.save(usuario);
  }

  async resetPassword(id: number, nuevaPassword: string): Promise<Usuario> {
    const usuario = await this.findOne(id);
    usuario.password = nuevaPassword;
    return this.usuarioRepo.save(usuario);
  }

  async changePassword(
    id: number,
    passwordActual: string,
    nuevaPassword: string,
  ): Promise<Usuario> {
    const usuario = await this.findOne(id);
    const isValid = await usuario.validatePassword(passwordActual);
    if (!isValid) throw new UnauthorizedException('Contraseña actual incorrecta');

    usuario.password = nuevaPassword;
    return this.usuarioRepo.save(usuario);
  }

  async softDelete(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuarioRepo.softRemove(usuario);
  }

  async restore(id: number): Promise<Usuario> {
    await this.usuarioRepo.restore(id);
    return this.findOne(id);
  }
}
