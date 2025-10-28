import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { BaseService } from '@common/base/base.service';

@Injectable()
export class EmpresasService extends BaseService<Empresa> {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
  ) {
    super(empresaRepo);
  }

  /**
   * Conveniencia: devuelve todos los registros incluyendo los eliminados (papelera).
   * Internamente delega a findDeleted() del BaseService.
   */
  async findAllIncludingDeleted(): Promise<Empresa[]> {
    return this.findDeleted();
  }

  /**
   * Si prefieres exponer un findDeleted() más explícito en este servicio (opcional)
   * ya lo tienes heredado del BaseService. Si quieres otra firma (paginada), la añadimos aquí.
   */

  /**
   * Ejemplo: método para obtener eliminados con paginación (opcional)
   */
  async findDeletedPaged(page = 1, limit = 20) {
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;

    const [items, total] = await this.empresaRepo
      .createQueryBuilder('e')
      .withDeleted()
      .where('e.fechaEliminacion IS NOT NULL')
      .orderBy('e.fechaEliminacion', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
