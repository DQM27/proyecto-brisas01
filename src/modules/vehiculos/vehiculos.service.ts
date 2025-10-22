import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from './entities/vehiculo.entity';
import { Contratista } from '../contratistas/entities/contratista.entity';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepo: Repository<Vehiculo>,

    @InjectRepository(Contratista)
    private readonly contratistaRepo: Repository<Contratista>,
  ) {}

  // 🚗 Crear vehículo
  async crear(dto: CreateVehiculoDto): Promise<Vehiculo> {
    let contratista: Contratista | null = null;

    if (dto.contratistaId) {
      contratista = await this.contratistaRepo.findOne({
        where: { id: dto.contratistaId },
      });

      if (!contratista) {
        throw new NotFoundException('Contratista no encontrado');
      }
    }

    const vehiculo = this.vehiculoRepo.create({
      ...dto,
      ...(contratista ? { contratista } : {}),
    });

    return this.vehiculoRepo.save(vehiculo);
  }

  // 📋 Obtener todos los vehículos
  async obtenerTodos(): Promise<Vehiculo[]> {
    return this.vehiculoRepo.find({
      relations: ['contratista'],
      order: { id: 'DESC' },
    });
  }

  // 🔍 Obtener un vehículo
  async obtenerUno(id: number): Promise<Vehiculo> {
    const vehiculo = await this.vehiculoRepo.findOne({
      where: { id },
      relations: ['contratista'],
    });

    if (!vehiculo) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    return vehiculo;
  }

  // 🛠️ Actualizar vehículo
  async actualizar(id: number, dto: UpdateVehiculoDto): Promise<Vehiculo> {
    const vehiculo = await this.obtenerUno(id);

    if (dto.contratistaId) {
      const contratista = await this.contratistaRepo.findOne({
        where: { id: dto.contratistaId },
      });
      if (!contratista) throw new NotFoundException('Contratista no encontrado');
      vehiculo.contratista = contratista;
    }

    Object.assign(vehiculo, dto);
    return this.vehiculoRepo.save(vehiculo);
  }

  // 🗑️ Eliminar vehículo
  async eliminar(id: number): Promise<void> {
    const vehiculo = await this.obtenerUno(id);
    await this.vehiculoRepo.remove(vehiculo);
  }
}
