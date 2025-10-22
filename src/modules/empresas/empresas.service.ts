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

  // Aquí puedes agregar métodos específicos de empresa si los necesitas
}
