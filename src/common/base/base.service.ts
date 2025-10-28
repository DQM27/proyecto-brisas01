import { NotFoundException } from '@nestjs/common';
import { Repository, DeepPartial, Not, IsNull } from 'typeorm';

export class BaseService<T extends { id: number }> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(): Promise<T[]> {
    return this.repository.find({
      where: { fechaEliminacion: IsNull() } as any,
    });
  }

  async findOne(id: number): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id, fechaEliminacion: IsNull() } as any,
    });
    if (!entity) throw new NotFoundException('Registro no encontrado');
    return entity;
  }

  async update(id: number, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  /** 🔥 Soft delete (mueve el registro a la papelera) */
  async softDelete(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.softRemove(entity);
  }

  /** 🗑️ Listar registros eliminados (papelera) */
  async findDeleted(): Promise<T[]> {
    return this.repository.find({
      withDeleted: true,
      where: { fechaEliminacion: Not(IsNull()) } as any,
    });
  }

  /** ♻️ Restaurar registro */
  async restore(id: number): Promise<T> {
    await this.repository.restore(id);
    return this.findOne(id);
  }
}
