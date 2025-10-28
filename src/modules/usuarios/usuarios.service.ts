import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RolUsuario } from '@common/enums/rol-usuario.enum';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    await this.ensureCorreoYcedulaUnicos(dto);

    const usuario = this.usuarioRepo.create({
      ...dto,
      rol: dto.rol ?? RolUsuario.SEGURIDAD,
    });

    try {
      return await this.usuarioRepo.save(usuario);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private async ensureCorreoYcedulaUnicos(dto: CreateUsuarioDto): Promise<void> {
    const existente = await this.usuarioRepo.findOne({
      where: [{ email: dto.email }, { cedula: dto.cedula }],
    });

    if (existente) {
      if (existente.email === dto.email) {
        throw new BadRequestException('El correo ya está registrado');
      }
      if (existente.cedula === dto.cedula) {
        throw new BadRequestException('La cédula ya está registrada');
      }
    }
  }

  private handleDatabaseError(error: any): never {
    if (error.code === '23505') {
      if (error.detail.includes('email')) {
        throw new BadRequestException('El correo ya está registrado');
      }
      if (error.detail.includes('cedula')) {
        throw new BadRequestException('La cédula ya está registrada');
      }
    }
    throw new BadRequestException('Error al guardar el usuario');
  }

  async findAll(page = 1, limit = 10) {
    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;

    const [usuarios, total] = await this.usuarioRepo
      .createQueryBuilder('usuario')
      .where('usuario.fechaEliminacion IS NULL')
      .andWhere('usuario.activo = :activo', { activo: true })
      .orderBy('usuario.fechaCreacion', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = plainToInstance(ResponseUsuarioDto, usuarios, {
      excludeExtraneousValues: true,
    });

    return {
      items: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({
      where: {
        id,
        fechaEliminacion: IsNull(),
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: {
        email,
        fechaEliminacion: IsNull(),
      },
    });
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    Object.assign(usuario, dto);
    return this.usuarioRepo.save(usuario);
  }

  async resetPassword(id: number, nuevaPassword: string): Promise<Usuario> {
    const usuario = await this.findOne(id);

    usuario.password = nuevaPassword; // se hash automatico por @BeforeUpdate()

    const actualizado = await this.usuarioRepo.save(usuario);

    return actualizado;
  }

  async changePassword(
    id: number,
    passwordActual: string,
    nuevaPassword: string,
  ): Promise<Usuario> {
    const usuario = await this.findOne(id);

    const isValid = await usuario.validatePassword(passwordActual);
    if (!isValid) throw new UnauthorizedException('Contraseña actual incorrecta');

    if (passwordActual === nuevaPassword) {
      throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
    }

    usuario.password = nuevaPassword;
    return this.usuarioRepo.save(usuario);
  }

  async suspender(id: number): Promise<Usuario> {
    return this.update(id, { activo: false });
  }

  async reactivar(id: number): Promise<Usuario> {
    return this.update(id, { activo: true });
  }

  async softDelete(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuarioRepo.softRemove(usuario);
  }

  async findDeleted(): Promise<Usuario[]> {
    return this.usuarioRepo.find({
      withDeleted: true,
      where: { fechaEliminacion: Not(IsNull()) },
    });
  }

  async restore(id: number): Promise<Usuario> {
    await this.usuarioRepo.restore(id);
    return this.findOne(id);
  }
}
