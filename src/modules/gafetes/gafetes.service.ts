import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Gafete } from './entities/gafete.entity';
import { CreateGafeteDto } from './dto/create-gafete.dto';
import { UpdateGafeteDto } from './dto/update-gafete.dto';
import { Contratista } from '../contratistas/entities/contratista.entity';

@Injectable()
export class GafetesService {
  constructor(
    @InjectRepository(Gafete)
    private readonly gafeteRepository: Repository<Gafete>,

    @InjectRepository(Contratista)
    private readonly contratistaRepository: Repository<Contratista>,
  ) {}

  async create(dto: CreateGafeteDto): Promise<Gafete> {
    // No pasamos el dto completo, creamos una instancia limpia
    const gafete = this.gafeteRepository.create();

    // Copiamos solo las propiedades simples (no relaciones)
    Object.assign(gafete, dto);

    // Si viene un contratistaId, lo cargamos y asignamos
    if (dto.contratistaId) {
      const contratista = await this.contratistaRepository.findOneBy({
        id: dto.contratistaId,
      });
      if (!contratista) throw new NotFoundException('Contratista no encontrado');
      gafete.contratista = contratista;
    }

    return this.gafeteRepository.save(gafete);
  }

  async findAll(): Promise<Gafete[]> {
    return this.gafeteRepository.find({
      relations: ['contratista'],
      where: { fechaEliminacion: IsNull() }, // ✅ usar IsNull() en lugar de null
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Gafete> {
    const gafete = await this.gafeteRepository.findOne({
      where: { id, fechaEliminacion: IsNull() }, // ✅ corregido
      relations: ['contratista'],
    });

    if (!gafete) throw new NotFoundException('Gafete no encontrado');
    return gafete;
  }

  async update(id: number, dto: UpdateGafeteDto): Promise<Gafete> {
    const gafete = await this.findOne(id);
    Object.assign(gafete, dto);

    if (dto.contratistaId) {
      const contratista = await this.contratistaRepository.findOneBy({
        id: dto.contratistaId,
      });
      if (!contratista) throw new NotFoundException('Contratista no encontrado');
      gafete.contratista = contratista;
    }

    return this.gafeteRepository.save(gafete);
  }

  async softDelete(id: number): Promise<void> {
    const gafete = await this.findOne(id);
    gafete.fechaEliminacion = new Date();
    await this.gafeteRepository.save(gafete);
  }

  async restore(id: number): Promise<void> {
    const gafete = await this.gafeteRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!gafete) throw new NotFoundException('Gafete no encontrado');

    gafete.fechaEliminacion = undefined;
    await this.gafeteRepository.save(gafete);
  }
}
