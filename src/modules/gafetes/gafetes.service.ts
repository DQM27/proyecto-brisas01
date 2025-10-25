import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Gafete } from './entities/gafete.entity';
import { CreateGafeteDto } from './dto/create-gafete.dto';
import { UpdateGafeteDto } from './dto/update-gafete.dto';
import { HistorialGafete } from './entities/historial-gafete.entity';
import { EstadoGafete } from '@common/enums/gafete-estado.enum';

@Injectable()
export class GafetesService {
  constructor(
    @InjectRepository(Gafete)
    private readonly gafeteRepo: Repository<Gafete>,

    @InjectRepository(HistorialGafete)
    private readonly historialRepo: Repository<HistorialGafete>,
  ) {}

  /** Crear un gafete */
  async create(dto: CreateGafeteDto): Promise<Gafete> {
    const gafete = this.gafeteRepo.create({
      codigo: dto.codigo,
      estado: dto.estado ?? EstadoGafete.ACTIVO,
    });
    return this.gafeteRepo.save(gafete);
  }

  /** Listar todos los gafetes */
  async findAll(): Promise<Gafete[]> {
    return this.gafeteRepo.find({
      relations: ['historial'],
      where: { fechaEliminacion: IsNull() },
      order: { id: 'DESC' },
    });
  }

  /** Obtener un gafete por ID */
  async findOne(id: number): Promise<Gafete> {
    const gafete = await this.gafeteRepo.findOne({
      where: { id, fechaEliminacion: IsNull() },
      relations: ['historial'],
    });
    if (!gafete) throw new NotFoundException('Gafete no encontrado');
    return gafete;
  }

  /** Actualizar gafete */
  async update(id: number, dto: UpdateGafeteDto): Promise<Gafete> {
    const gafete = await this.findOne(id);
    Object.assign(gafete, dto);
    return this.gafeteRepo.save(gafete);
  }

  /** Eliminar gafete (soft delete) */
  async softDelete(id: number): Promise<void> {
    const gafete = await this.findOne(id);
    gafete.fechaEliminacion = new Date();
    await this.gafeteRepo.save(gafete);
  }

  /** Restaurar gafete eliminado */
  async restore(id: number): Promise<Gafete> {
    const gafete = await this.gafeteRepo.findOne({ where: { id }, withDeleted: true });
    if (!gafete) throw new NotFoundException('Gafete no encontrado');
    gafete.fechaEliminacion = undefined;
    return this.gafeteRepo.save(gafete);
  }

  /** Cambiar el estado de un gafete manualmente */
  async cambiarEstado(id: number, nuevoEstado: EstadoGafete): Promise<Gafete> {
    const gafete = await this.findOne(id);
    gafete.estado = nuevoEstado;

    // Si se reactiva, se asegura que no tenga contratista asignado
    if (nuevoEstado === EstadoGafete.ACTIVO) {
      gafete.contratista = undefined;
    }

    return this.gafeteRepo.save(gafete);
  }

  /** Obtener todos los gafetes pendientes (no devueltos) */
  async pendientes(): Promise<HistorialGafete[]> {
    return this.historialRepo.find({
      where: { fechaDevolucion: IsNull() },
      relations: ['gafete', 'ingreso'],
    });
  }
}
