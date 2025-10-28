import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListaNegra } from './entities/lista-negra.entity';
import { Contratista } from '../contratistas/entities/contratista.entity';
import { CreateListaNegraDto } from './dto/create-lista-negra.dto';
import { UpdateListaNegraDto } from './dto/update-lista-negra.dto';

@Injectable()
export class ListaNegraService {
  constructor(
    @InjectRepository(ListaNegra)
    private readonly listaNegraRepo: Repository<ListaNegra>,

    @InjectRepository(Contratista)
    private readonly contratistaRepo: Repository<Contratista>,
  ) {}

  async crear(dto: CreateListaNegraDto): Promise<ListaNegra> {
    const contratista = await this.contratistaRepo.findOne({
      where: { id: dto.contratistaId },
    });

    if (!contratista) {
      throw new NotFoundException('Contratista no encontrado.');
    }

    const entrada = this.listaNegraRepo.create({
      grupoRiesgo: dto.grupoRiesgo,
      causa: dto.causa,
      nivelRiesgo: dto.nivelRiesgo,
      observaciones: dto.observaciones ?? undefined,
    });

    entrada.contratista = contratista;

    return this.listaNegraRepo.save(entrada);
  }
  async obtenerTodos(): Promise<ListaNegra[]> {
    return this.listaNegraRepo.find({ relations: ['contratista'] });
  }

  async obtenerUno(id: number): Promise<ListaNegra> {
    const entrada = await this.listaNegraRepo.findOne({
      where: { id },
      relations: ['contratista'],
    });

    if (!entrada) {
      throw new NotFoundException('Entrada no encontrada.');
    }

    return entrada;
  }

  async actualizar(id: number, dto: UpdateListaNegraDto): Promise<ListaNegra> {
    const entrada = await this.obtenerUno(id);

    Object.assign(entrada, dto);

    return this.listaNegraRepo.save(entrada);
  }

  async retirar(id: number): Promise<ListaNegra> {
    const entrada = await this.obtenerUno(id);
    entrada.retirarDeLista();
    return this.listaNegraRepo.save(entrada);
  }

  async eliminar(id: number): Promise<void> {
    const entrada = await this.obtenerUno(id);
    await this.listaNegraRepo.remove(entrada);
  }
}
