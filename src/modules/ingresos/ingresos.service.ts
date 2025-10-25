import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Ingreso } from './entities/ingreso.entity';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { Contratista } from '../contratistas/entities/contratista.entity';
import { Gafete } from '../gafetes/entities/gafete.entity';
import { TipoAutorizacion } from '../../common/enums/tipo-autorizacion.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { EstadoGafete } from '@common/enums/gafete-estado.enum';

@Injectable()
export class IngresosService {
  constructor(
    @InjectRepository(Ingreso)
    private readonly ingresoRepo: Repository<Ingreso>,

    @InjectRepository(Contratista)
    private readonly contratistaRepo: Repository<Contratista>,

    @InjectRepository(Gafete)
    private readonly gafeteRepo: Repository<Gafete>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async registrarIngreso(dto: CreateIngresoDto, usuarioId: number): Promise<Ingreso> {
    const contratista = dto.contratistaId
      ? await this.contratistaRepo.findOne({
          where: { id: dto.contratistaId, fechaEliminacion: IsNull() },
          relations: ['entradasListaNegra'],
        })
      : null;

    if (contratista?.estaEnListaNegra()) {
      throw new BadRequestException('El contratista está en lista negra.');
    }

    const gafete = dto.gafeteId
      ? await this.gafeteRepo.findOne({ where: { id: dto.gafeteId } })
      : null;

    if (gafete && gafete.estado !== EstadoGafete.ACTIVO) {
      throw new BadRequestException('El gafete no está disponible.');
    }

    const ingresoActivo = contratista
      ? await this.ingresoRepo.findOne({
          where: { contratista: { id: contratista.id }, dentroFuera: true },
        })
      : null;

    if (ingresoActivo) {
      throw new BadRequestException('El contratista ya tiene un ingreso activo.');
    }

    const usuario = await this.usuarioRepo.findOneBy({ id: usuarioId });

    const ingreso = this.ingresoRepo.create({
      contratista: contratista ?? undefined,
      gafete: gafete ?? undefined,
      tipoAutorizacion: dto.tipoAutorizacion ?? TipoAutorizacion.AUTOMATICA,
      fechaIngreso: new Date(),
      dentroFuera: true,
      observaciones: dto.observaciones ?? undefined,
      ingresadoPor: usuario ?? undefined,
    });

    return this.ingresoRepo.save(ingreso);
  }

  async registrarSalida(contratistaId: number, usuarioId: number): Promise<Ingreso> {
    const ingreso = await this.ingresoRepo.findOne({
      where: {
        contratista: { id: contratistaId },
        dentroFuera: true,
      },
      relations: ['contratista'],
    });

    if (!ingreso) throw new NotFoundException('No se encontró un ingreso activo.');

    const usuario = await this.usuarioRepo.findOneBy({ id: usuarioId });

    ingreso.fechaSalida = new Date();
    ingreso.dentroFuera = false;
    ingreso.sacadoPor = usuario;

    return this.ingresoRepo.save(ingreso);
  }

  async findAll(): Promise<Ingreso[]> {
    return this.ingresoRepo.find({
      relations: ['contratista', 'gafete', 'ingresadoPor', 'sacadoPor'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Ingreso> {
    const ingreso = await this.ingresoRepo.findOne({
      where: { id },
      relations: ['contratista', 'gafete', 'ingresadoPor', 'sacadoPor'],
    });
    if (!ingreso) throw new NotFoundException('Ingreso no encontrado.');
    return ingreso;
  }

  async update(id: number, dto: UpdateIngresoDto): Promise<Ingreso> {
    const ingreso = await this.findOne(id);
    Object.assign(ingreso, dto);
    return this.ingresoRepo.save(ingreso);
  }
}
