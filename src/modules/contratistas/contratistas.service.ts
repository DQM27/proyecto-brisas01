import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Contratista } from './entities/contratista.entity';
import { CreateContratistaDto } from './dto/create-contratista.dto';
import { UpdateContratistaDto } from './dto/update-contratista.dto';
import { Empresa } from '../empresas/entities/empresa.entity';

@Injectable()
export class ContratistasService {
  constructor(
    @InjectRepository(Contratista)
    private readonly contratistaRepository: Repository<Contratista>,

    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  /**
   * Crear un nuevo contratista
   */
  async create(dto: CreateContratistaDto): Promise<Contratista> {
    const contratista = this.contratistaRepository.create(dto as Partial<Contratista>);

    if (dto.empresaId) {
      const empresa = await this.empresaRepository.findOneBy({
        id: dto.empresaId,
      });
      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }
      contratista.empresa = empresa;
    }

    return this.contratistaRepository.save(contratista);
  }

  /**
   * Obtener todos los contratistas activos (no eliminados)
   */
  async findAll(): Promise<Contratista[]> {
    return this.contratistaRepository.find({
      relations: ['empresa'],
      where: { fechaEliminacion: IsNull() },
      order: { id: 'DESC' },
    });
  }

  /**
   * Obtener un contratista específico
   */
  async findOne(id: number): Promise<Contratista> {
    const contratista = await this.contratistaRepository.findOne({
      where: { id, fechaEliminacion: IsNull() },
      relations: ['empresa'],
    });

    if (!contratista) {
      throw new NotFoundException('Contratista no encontrado');
    }

    return contratista;
  }

  /**
   * Actualizar un contratista
   */
  async update(id: number, dto: UpdateContratistaDto): Promise<Contratista> {
    const contratista = await this.findOne(id);
    Object.assign(contratista, dto);

    if (dto.empresaId) {
      const empresa = await this.empresaRepository.findOneBy({
        id: dto.empresaId,
      });
      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }
      contratista.empresa = empresa;
    }

    return this.contratistaRepository.save(contratista);
  }

  /**
   * Eliminación lógica (soft delete)
   */
  async softDelete(id: number): Promise<void> {
    const contratista = await this.findOne(id);
    contratista.fechaEliminacion = new Date();
    await this.contratistaRepository.save(contratista);
  }

  /**
   * Restaurar un contratista eliminado
   */
  async restore(id: number): Promise<void> {
    const contratista = await this.contratistaRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!contratista) {
      throw new NotFoundException('Contratista no encontrado');
    }

    contratista.fechaEliminacion = undefined;
    await this.contratistaRepository.save(contratista);
  }
}
