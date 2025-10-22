import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PuntoAcceso } from './entities/punto-acceso.entity';
import { CreatePuntoAccesoDto } from './dto/create-punto-acceso.dto';
import { UpdatePuntoAccesoDto } from './dto/update-punto-acceso.dto';

@Injectable()
export class PuntoAccesoService {
  constructor(
    @InjectRepository(PuntoAcceso)
    private readonly puntoAccesoRepo: Repository<PuntoAcceso>,
  ) {}

  async crear(dto: CreatePuntoAccesoDto): Promise<PuntoAcceso> {
    const nuevo = this.puntoAccesoRepo.create(dto);
    return this.puntoAccesoRepo.save(nuevo);
  }

  async obtenerTodos(): Promise<PuntoAcceso[]> {
    return this.puntoAccesoRepo.find();
  }

  async obtenerUno(id: number): Promise<PuntoAcceso> {
    const punto = await this.puntoAccesoRepo.findOne({ where: { id } });
    if (!punto) throw new NotFoundException('Punto de acceso no encontrado.');
    return punto;
  }

  async actualizar(id: number, dto: UpdatePuntoAccesoDto): Promise<PuntoAcceso> {
    const punto = await this.obtenerUno(id);
    Object.assign(punto, dto);
    return this.puntoAccesoRepo.save(punto);
  }

  async eliminar(id: number): Promise<void> {
    const punto = await this.obtenerUno(id);
    await this.puntoAccesoRepo.remove(punto);
  }
}
