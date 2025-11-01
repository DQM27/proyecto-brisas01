import { EstadoDevolucionGafete } from '@common/enums/estado-devolucion-gafete.enum';
import { TipoAutorizacion } from '@common/enums/tipo-autorizacion.enum';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { HistorialGafete } from '../gafetes/entities/historial-gafete.entity';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { Ingreso } from './entities/ingreso.entity';
import { IngresoValidationService } from './ingreso-validation.service';
import { IngresoNoEncontradoException } from './ingresos.exceptions';

@Injectable()
export class IngresosService {
  private readonly logger = new Logger(IngresosService.name);

  constructor(
    @InjectRepository(Ingreso)
    private readonly ingresoRepo: Repository<Ingreso>,

    @InjectRepository(HistorialGafete)
    private readonly historialRepo: Repository<HistorialGafete>,

    private readonly dataSource: DataSource,
    private readonly validationService: IngresoValidationService,
  ) {}

  /**
   * Registra el ingreso de un contratista a las instalaciones.
   */
  async registrarIngreso(dto: CreateIngresoDto, usuarioId: number): Promise<Ingreso> {
    this.logger.log(`Iniciando registro de ingreso para contratista ${dto.contratistaId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const contratista = await this.validationService.validarYObtenerContratista(
        dto.contratistaId,
      );
      await this.validationService.validarReglasNegocioIngreso(contratista);
      const gafete = await this.validationService.validarYObtenerGafete(dto.gafeteId);
      const usuario = await this.validationService.validarYObtenerUsuario(usuarioId);

      const ingreso = queryRunner.manager.create(Ingreso, {
        contratista,
        gafete,
        tipoAutorizacion: dto.tipoAutorizacion ?? TipoAutorizacion.AUTOMATICA,
        fechaIngreso: new Date(),
        dentroFuera: true,
        observaciones: dto.observaciones,
        ingresadoPor: usuario,
        vehiculo: dto.vehiculoId ? ({ id: dto.vehiculoId } as any) : undefined,
        puntoEntrada: dto.puntoEntradaId ? ({ id: dto.puntoEntradaId } as any) : undefined,
      });

      const savedIngreso = await queryRunner.manager.save(Ingreso, ingreso);

      if (gafete) {
        const historial = queryRunner.manager.create(HistorialGafete, {
          gafete,
          contratista,
          ingreso: savedIngreso,
          fechaAsignacion: new Date(),
          estadoDevolucion: EstadoDevolucionGafete.BUENO,
        });
        await queryRunner.manager.save(HistorialGafete, historial);
        this.logger.log(`Historial de gafete ${gafete.id} creado para ingreso ${savedIngreso.id}`);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Ingreso ${savedIngreso.id} registrado exitosamente`);

      return this.findOne(savedIngreso.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error al registrar ingreso: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Registra la salida de un contratista.
   */
  async registrarSalida(
    contratistaId: number,
    usuarioId: number,
    gafeteEstado?: EstadoDevolucionGafete,
  ): Promise<Ingreso> {
    this.logger.log(`Iniciando registro de salida para contratista ${contratistaId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ingreso = await this.validationService.validarYObtenerIngresoActivo(contratistaId);
      const usuario = await this.validationService.validarYObtenerUsuario(usuarioId);

      ingreso.fechaSalida = new Date();
      ingreso.dentroFuera = false;
      ingreso.sacadoPor = usuario;

      const updatedIngreso = await queryRunner.manager.save(Ingreso, ingreso);

      if (ingreso.gafete) {
        const historial = await queryRunner.manager.findOne(HistorialGafete, {
          where: { ingreso: { id: ingreso.id } },
        });

        if (historial) {
          historial.fechaDevolucion = new Date();
          historial.estadoDevolucion = gafeteEstado ?? EstadoDevolucionGafete.BUENO;
          await queryRunner.manager.save(HistorialGafete, historial);
          this.logger.log(`Historial de gafete ${ingreso.gafete.id} actualizado`);
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Salida registrada exitosamente para contratista ${contratistaId}`);

      return this.findOne(updatedIngreso.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error al registrar salida: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene todos los ingresos con paginación.
   * Usa QueryBuilder + addSelect para cargar campos anidados.
   */
  // ... (registrarIngreso, registrarSalida, update, calcularTiempoIngreso sin cambios)

  async findAll(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.ingresoRepo.findAndCount({
      relations: [
        'contratista',
        'contratista.empresa',
        'gafete',
        'ingresadoPor',
        'sacadoPor',
        'vehiculo',
        'puntoEntrada',
        'puntoSalida',
      ],
      select: {
        ingresadoPor: {
          id: true,
          primerNombre: true,
          primerApellido: true,
        },
        sacadoPor: {
          id: true,
          primerNombre: true,
          primerApellido: true,
        },
      },
      where: { fechaEliminacion: IsNull() },
      order: { id: 'DESC' },
      take: limit,
      skip,
    });

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Ingreso> {
    const ingreso = await this.ingresoRepo.findOne({
      where: { id, fechaEliminacion: IsNull() },
      relations: [
        'contratista',
        'contratista.empresa',
        'gafete',
        'ingresadoPor',
        'sacadoPor',
        'vehiculo',
        'puntoEntrada',
        'puntoSalida',
      ],
      select: {
        ingresadoPor: { id: true, primerNombre: true, primerApellido: true },
        sacadoPor: { id: true, primerNombre: true, primerApellido: true },
      },
    });

    if (!ingreso) throw new IngresoNoEncontradoException(id);
    return ingreso;
  }
  /**
   * Actualiza un ingreso existente.
   */
  async update(id: number, dto: UpdateIngresoDto): Promise<Ingreso> {
    const ingreso = await this.findOne(id);

    if (dto.observaciones !== undefined) {
      ingreso.observaciones = dto.observaciones;
    }
    if (dto.tipoAutorizacion !== undefined) {
      ingreso.tipoAutorizacion = dto.tipoAutorizacion;
    }

    const updated = await this.ingresoRepo.save(ingreso);
    this.logger.log(`Ingreso ${id} actualizado exitosamente`);

    return this.findOne(updated.id);
  }

  /**
   * Calcula el tiempo de estancia.
   * @deprecated Usar calcularDuracion() en DTO
   */
  async calcularTiempoIngreso(ingresoId: number): Promise<string> {
    const ingreso = await this.findOne(ingresoId);
    return ingreso.calcularDuracion();
  }
}
