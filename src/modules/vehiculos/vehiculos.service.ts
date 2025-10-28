import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    const contratista = await this.contratistaRepo.findOne({ where: { id: dto.contratistaId } });
    if (!contratista) throw new NotFoundException('Contratista no encontrado');
    if (!contratista.activo)
      throw new BadRequestException('No se puede asignar vehículo a un contratista inactivo');

    const existe = await this.vehiculoRepo.findOne({ where: { numeroPlaca: dto.numeroPlaca } });
    if (existe) throw new BadRequestException('La placa ya está registrada');

    const vehiculo = this.vehiculoRepo.create({
      ...dto,
      contratista,
    });

    return this.vehiculoRepo.save(vehiculo);
  }

  // 📋 Obtener todos los vehículos activos
  async obtenerTodos(): Promise<Vehiculo[]> {
    return this.vehiculoRepo.find({
      where: { activo: true },
      relations: ['contratista'],
      order: { id: 'DESC' },
    });
  }

  // 🔍 Obtener un vehículo por ID
  async obtenerUno(id: number): Promise<Vehiculo> {
    const vehiculo = await this.vehiculoRepo.findOne({
      where: { id, activo: true },
      relations: ['contratista'],
    });
    if (!vehiculo) throw new NotFoundException('Vehículo no encontrado');
    return vehiculo;
  }

  // 🛠️ Actualizar vehículo
  async actualizar(id: number, dto: UpdateVehiculoDto): Promise<Vehiculo> {
    const vehiculo = await this.obtenerUno(id);

    if (dto.contratistaId) {
      const contratista = await this.contratistaRepo.findOne({ where: { id: dto.contratistaId } });
      if (!contratista) throw new NotFoundException('Contratista no encontrado');
      if (!contratista.activo)
        throw new BadRequestException('No se puede asignar vehículo a un contratista inactivo');
      vehiculo.contratista = contratista;
    }

    Object.assign(vehiculo, dto);
    return this.vehiculoRepo.save(vehiculo);
  }

  // 🚗 Obtener vehículos por contratista
  async obtenerPorContratista(contratistaId: number): Promise<Vehiculo[]> {
    const contratista = await this.contratistaRepo.findOne({ where: { id: contratistaId } });
    if (!contratista) throw new NotFoundException('Contratista no encontrado');

    return this.vehiculoRepo.find({
      where: { contratista: { id: contratistaId }, activo: true },
      relations: ['contratista'],
      order: { numeroPlaca: 'ASC' },
    });
  }

  // 🗑️ Soft delete
  async eliminar(id: number): Promise<void> {
    const vehiculo = await this.obtenerUno(id);
    if (!vehiculo.activo) throw new BadRequestException('El vehículo ya está inactivo');

    vehiculo.activo = false;
    await this.vehiculoRepo.save(vehiculo);
  }

  // ♻️ Restaurar vehículo
  async restaurar(id: number): Promise<Vehiculo> {
    const vehiculo = await this.vehiculoRepo.findOne({ where: { id } });
    if (!vehiculo) throw new NotFoundException('Vehículo no encontrado');
    if (vehiculo.activo) throw new BadRequestException('El vehículo ya está activo');

    vehiculo.activo = true;
    return this.vehiculoRepo.save(vehiculo);
  }
}
