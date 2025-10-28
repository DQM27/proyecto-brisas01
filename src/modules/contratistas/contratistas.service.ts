import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(dto: CreateContratistaDto): Promise<Contratista> {
    await this.ensureCedulaIsUnique(dto.cedula);

    const empresa = await this.empresaRepository.findOneBy({ id: dto.empresaId });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    const contratista = this.contratistaRepository.create({ ...dto, empresa });

    try {
      return await this.contratistaRepository.save(contratista);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private async ensureCedulaIsUnique(cedula: string): Promise<void> {
    const exists = await this.contratistaRepository.findOne({ where: { cedula } });
    if (exists) throw new BadRequestException('La cédula ya está registrada');
  }

  private handleDatabaseError(error: any): never {
    if (error.code === '23505' && error.detail.includes('cedula')) {
      throw new BadRequestException('La cédula ya está registrada');
    }
    throw new BadRequestException('Error al guardar el contratista');
  }

  async findAll(): Promise<Contratista[]> {
    return this.contratistaRepository.find({
      relations: ['empresa'],
      where: { activo: true },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number, incluirInactivos = false): Promise<Contratista> {
    if (!id || id <= 0) throw new BadRequestException('ID inválido');

    const where: any = { id };
    if (!incluirInactivos) where.activo = true;

    const contratista = await this.contratistaRepository.findOne({
      where,
      relations: ['empresa'],
    });

    if (!contratista) throw new NotFoundException(`Contratista con ID ${id} no encontrado`);

    return contratista;
  }

  async update(id: number, dto: UpdateContratistaDto): Promise<Contratista> {
    const contratista = await this.findOne(id);

    Object.assign(contratista, dto);

    if (dto.empresaId !== undefined) {
      const empresa = await this.empresaRepository.findOne({ where: { id: dto.empresaId } });
      if (!empresa) throw new NotFoundException(`Empresa con ID ${dto.empresaId} no encontrada`);
      contratista.empresa = empresa;
    }

    try {
      return await this.contratistaRepository.save(contratista);
    } catch (error) {
      if (error.code === '23505')
        throw new BadRequestException('El contratista ya existe con estos datos');
      throw error;
    }
  }

  async softDelete(id: number): Promise<void> {
    const contratista = await this.findOne(id);
    if (!contratista.activo) throw new BadRequestException('El contratista ya está inactivo');

    contratista.activo = false;
    await this.contratistaRepository.save(contratista);
  }

  async restore(id: number): Promise<void> {
    const contratista = await this.findOne(id, true);
    if (contratista.activo) throw new BadRequestException('El contratista ya está activo');

    contratista.activo = true;
    await this.contratistaRepository.save(contratista);
  }
}
