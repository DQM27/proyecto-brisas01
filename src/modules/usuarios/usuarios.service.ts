import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '@common/enums/rol-usuario.enum';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    // 🧩 Convertir rol a enum (si llega como string)
    const rol = dto.rol ? (dto.rol as RolUsuario) : RolUsuario.OPERADOR;

    // 🔒 Hashear contraseña manualmente (aunque la entidad también lo hace)
    const hashed = await bcrypt.hash(dto.password, 10);

    // ✅ Crear instancia del usuario correctamente mapeada
    const usuario = this.usuarioRepo.create({
      primerNombre: dto.primerNombre,
      segundoNombre: dto.segundoNombre,
      primerApellido: dto.primerApellido,
      segundoApellido: dto.segundoApellido,
      cedula: dto.cedula,
      email: dto.email,
      telefono: dto.telefono,
      password: hashed,
      rol,
    });

    return await this.usuarioRepo.save(usuario);
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepo.find({
      where: { fechaEliminacion: IsNull() },
    });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id, fechaEliminacion: IsNull() },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);

    // Si se envía password, la hasheamos antes de guardar
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(usuario, dto);
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
