import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Ingreso } from './entities/ingreso.entity';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { Contratista } from '../contratistas/entities/contratista.entity';
import { Gafete } from '../gafetes/entities/gafete.entity';
import { HistorialGafete } from '../gafetes/entities/historial-gafete.entity';
import { TipoAutorizacion } from '../../common/enums/tipo-autorizacion.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { EstadoGafete } from '@common/enums/gafete-estado.enum';
import { EstadoDevolucionGafete } from '@common/enums/estado-devolucion-gafete.enum';

@Injectable()
export class IngresosService {
  constructor(
    @InjectRepository(Ingreso)
    private readonly ingresoRepo: Repository<Ingreso>,

    @InjectRepository(Contratista)
    private readonly contratistaRepo: Repository<Contratista>,

    @InjectRepository(Gafete)
    private readonly gafeteRepo: Repository<Gafete>,

    @InjectRepository(HistorialGafete)
    private readonly historialRepo: Repository<HistorialGafete>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  /** Registrar ingreso */
  async registrarIngreso(dto: CreateIngresoDto, usuarioId: number): Promise<Ingreso> {
    const contratista = dto.contratistaId
      ? await this.contratistaRepo.findOne({
          where: { id: dto.contratistaId, fechaEliminacion: IsNull() },
          relations: ['entradasListaNegra', 'ingresos'],
        })
      : null;

    if (contratista) {
      if (contratista.estaEnListaNegra()) {
        throw new BadRequestException('El contratista está en lista negra.');
      }
      if (contratista.tienePraindVencido()) {
        throw new BadRequestException('El Praind del contratista está vencido.');
      }
      const ingresoActivo = await this.ingresoRepo.findOne({
        where: { contratista: { id: contratista.id }, dentroFuera: true },
      });
      if (ingresoActivo) {
        throw new BadRequestException('El contratista ya tiene un ingreso activo.');
      }
    }

    let gafete: Gafete | null | undefined = undefined;

    if (dto.gafeteId) {
      gafete = await this.gafeteRepo.findOne({ where: { id: dto.gafeteId } });
      if (!gafete) throw new BadRequestException('El gafete no existe.');
      if (gafete.estado !== EstadoGafete.ACTIVO) {
        throw new BadRequestException(`El gafete no está disponible. Estado: ${gafete.estado}`);
      }

      const gafeteEnUso = await this.ingresoRepo.findOne({
        where: { gafete: { id: gafete.id }, dentroFuera: true },
      });
      if (gafeteEnUso) {
        throw new BadRequestException('El gafete ya está en uso en otro ingreso.');
      }
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

    const savedIngreso = await this.ingresoRepo.save(ingreso);

    // Crear historial de gafete si se entregó uno
    if (gafete) {
      const historial = this.historialRepo.create({
        gafete,
        contratista: contratista ?? undefined,
        ingreso: savedIngreso ?? undefined,
        fechaAsignacion: new Date(),
        estadoDevolucion: EstadoDevolucionGafete.BUENO,
      });
      await this.historialRepo.save(historial);
    }

    return savedIngreso;
  }

  /** Registrar salida */
  async registrarSalida(
    contratistaId: number,
    usuarioId: number,
    gafeteEstado?: EstadoDevolucionGafete,
  ): Promise<Ingreso> {
    const ingreso = await this.ingresoRepo.findOne({
      where: { contratista: { id: contratistaId }, dentroFuera: true },
      relations: ['contratista', 'gafete'],
    });
    if (!ingreso) throw new NotFoundException('No se encontró un ingreso activo.');

    const usuario = await this.usuarioRepo.findOneBy({ id: usuarioId });

    ingreso.fechaSalida = new Date();
    ingreso.dentroFuera = false;
    ingreso.sacadoPor = usuario;

    const savedIngreso = await this.ingresoRepo.save(ingreso);

    // Actualizar historial de gafete
    if (ingreso.gafete) {
      const historial = await this.historialRepo.findOne({
        where: { ingreso: { id: ingreso.id } },
      });
      if (historial) {
        historial.fechaDevolucion = new Date();
        historial.estadoDevolucion = gafeteEstado ?? EstadoDevolucionGafete.BUENO;
        await this.historialRepo.save(historial);
      }
    }

    return savedIngreso;
  }

  /** Obtener todos los ingresos */
  async findAll(): Promise<Ingreso[]> {
    return this.ingresoRepo.find({
      relations: ['contratista', 'gafete', 'ingresadoPor', 'sacadoPor'],
      order: { id: 'DESC' },
    });
  }

  /** Obtener ingreso específico */
  async findOne(id: number): Promise<Ingreso> {
    const ingreso = await this.ingresoRepo.findOne({
      where: { id },
      relations: ['contratista', 'gafete', 'ingresadoPor', 'sacadoPor'],
    });
    if (!ingreso) throw new NotFoundException('Ingreso no encontrado.');
    return ingreso;
  }

  /** Actualizar ingreso */
  async update(id: number, dto: UpdateIngresoDto): Promise<Ingreso> {
    const ingreso = await this.findOne(id);
    Object.assign(ingreso, dto);
    return this.ingresoRepo.save(ingreso);
  }

  /** Calcular tiempo del ingreso */
  async calcularTiempoIngreso(ingresoId: number): Promise<string> {
    const ingreso = await this.ingresoRepo.findOne({ where: { id: ingresoId } });
    if (!ingreso) throw new NotFoundException('Ingreso no encontrado');
    if (!ingreso.fechaIngreso) return 'Fecha de ingreso no disponible';

    const fin = ingreso.fechaSalida ?? new Date();
    const diffMs = fin.getTime() - ingreso.fechaIngreso.getTime();
    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${horas}h ${minutos}m ${segundos}s`;
  }
}
