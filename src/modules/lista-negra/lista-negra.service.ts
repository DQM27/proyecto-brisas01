import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contratista } from '../contratistas/entities/contratista.entity';
import { CreateListaNegraDto } from './dto/create-lista-negra.dto';
import { UpdateListaNegraDto } from './dto/update-lista-negra.dto';
import { ListaNegra } from './entities/lista-negra.entity';

@Injectable()
export class ListaNegraService {
  constructor(
    @InjectRepository(ListaNegra)
    private readonly listaNegraRepo: Repository<ListaNegra>,

    @InjectRepository(Contratista)
    private readonly contratistaRepo: Repository<Contratista>,
  ) {}

  async crear(dto: CreateListaNegraDto): Promise<ListaNegra> {
    // 1️⃣ Verificar que exista el contratista
    const contratista = await this.contratistaRepo.findOne({
      where: { id: dto.contratistaId },
    });

    if (!contratista) {
      throw new NotFoundException('Contratista no encontrado.');
    }

    // 2️⃣ VERIFICAR DUPLICADO
    const existente = await this.listaNegraRepo.findOne({
      where: { contratista: { id: dto.contratistaId }, entradaActiva: true },
    });

    if (existente) {
      throw new ConflictException('Este contratista ya está en lista negra activa.');
    }

    // 3️⃣ Crear la nueva entrada
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
