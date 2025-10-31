import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Ingreso } from './entities/ingreso.entity';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { HistorialGafete } from '../gafetes/entities/historial-gafete.entity';
import { TipoAutorizacion } from '@common/enums/tipo-autorizacion.enum';
import { EstadoDevolucionGafete } from '@common/enums/estado-devolucion-gafete.enum';
import { IngresoValidationService } from './ingreso-validation.service';
import { IngresoNoEncontradoException } from './ingresos.exceptions';

/**
 * Servicio principal para la gestión de ingresos de contratistas.
 *
 * @remarks
 * Este servicio orquesta las operaciones de ingreso y salida, delegando
 * las validaciones al servicio especializado y usando transacciones para
 * garantizar la consistencia de los datos.
 */
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
   *
   * @remarks
   * Esta operación se ejecuta dentro de una transacción para garantizar
   * que tanto el ingreso como el historial del gafete se registren de forma atómica.
   *
   * @param dto - Datos del ingreso a registrar
   * @param usuarioId - ID del usuario que registra el ingreso
   * @returns El ingreso registrado con todas sus relaciones cargadas
   * @throws {ContratistaNoEncontradoException} Si el contratista no existe
   * @throws {ContratistaEnListaNegraException} Si el contratista está en lista negra
   * @throws {PraindVencidoException} Si el Praind está vencido
   * @throws {IngresoActivoExistenteException} Si ya existe un ingreso activo
   * @throws {GafeteNoDisponibleException} Si el gafete no está disponible
   * @throws {UsuarioNoEncontradoException} Si el usuario no existe
   */
  async registrarIngreso(dto: CreateIngresoDto, usuarioId: number): Promise<Ingreso> {
    this.logger.log(`Iniciando registro de ingreso para contratista ${dto.contratistaId}`);

    // Crear QueryRunner para manejar la transacción manualmente
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ✅ VALIDACIONES (usando servicio dedicado)
      const contratista = await this.validationService.validarYObtenerContratista(
        dto.contratistaId,
      );
      await this.validationService.validarReglasNegocioIngreso(contratista);
      const gafete = await this.validationService.validarYObtenerGafete(dto.gafeteId);
      const usuario = await this.validationService.validarYObtenerUsuario(usuarioId);

      // ✅ CREAR INGRESO (dentro de la transacción)
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

      // ✅ CREAR HISTORIAL DE GAFETE (si aplica)
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

      // ✅ COMMIT de la transacción
      await queryRunner.commitTransaction();

      this.logger.log(
        `Ingreso ${savedIngreso.id} registrado exitosamente para contratista ${dto.contratistaId}`,
      );

      // Cargar relaciones para el retorno
      return this.findOne(savedIngreso.id);
    } catch (error) {
      // ✅ ROLLBACK en caso de error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error al registrar ingreso: ${error.message}`, error.stack);
      throw error;
    } finally {
      // ✅ LIBERAR la conexión
      await queryRunner.release();
    }
  }

  /**
   * Registra la salida de un contratista de las instalaciones.
   *
   * @remarks
   * Esta operación actualiza el ingreso activo y el historial del gafete
   * dentro de una transacción para mantener la consistencia.
   *
   * @param contratistaId - ID del contratista que sale
   * @param usuarioId - ID del usuario que registra la salida
   * @param gafeteEstado - Estado del gafete al ser devuelto (opcional)
   * @returns El ingreso actualizado con la salida registrada
   * @throws {IngresoActivoNoEncontradoException} Si no existe un ingreso activo
   * @throws {UsuarioNoEncontradoException} Si el usuario no existe
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
      // ✅ VALIDACIONES
      const ingreso = await this.validationService.validarYObtenerIngresoActivo(contratistaId);
      const usuario = await this.validationService.validarYObtenerUsuario(usuarioId);

      // ✅ ACTUALIZAR INGRESO
      ingreso.fechaSalida = new Date();
      ingreso.dentroFuera = false;
      ingreso.sacadoPor = usuario;

      const updatedIngreso = await queryRunner.manager.save(Ingreso, ingreso);

      // ✅ ACTUALIZAR HISTORIAL DE GAFETE (si aplica)
      if (ingreso.gafete) {
        const historial = await queryRunner.manager.findOne(HistorialGafete, {
          where: { ingreso: { id: ingreso.id } },
        });

        if (historial) {
          historial.fechaDevolucion = new Date();
          historial.estadoDevolucion = gafeteEstado ?? EstadoDevolucionGafete.BUENO;
          await queryRunner.manager.save(HistorialGafete, historial);
          this.logger.log(
            `Historial de gafete ${ingreso.gafete.id} actualizado para ingreso ${ingreso.id}`,
          );
        }
      }

      // ✅ COMMIT
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
   *
   * @param page - Número de página (comienza en 1)
   * @param limit - Cantidad de registros por página
   * @returns Lista paginada de ingresos con sus relaciones
   */
  async findAll(
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    data: Ingreso[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.ingresoRepo.findAndCount({
      relations: [
        'contratista',
        'contratista.empresa', // Para tener datos completos del contratista
        'gafete',
        'ingresadoPor',
        'sacadoPor',
        'vehiculo',
        'puntoEntrada',
        'puntoSalida',
      ],
      where: { fechaEliminacion: IsNull() },
      order: { id: 'DESC' },
      take: limit,
      skip,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene un ingreso específico por su ID.
   *
   * @param id - ID del ingreso a buscar
   * @returns El ingreso con todas sus relaciones cargadas
   * @throws {IngresoNoEncontradoException} Si el ingreso no existe
   */
  async findOne(id: number): Promise<Ingreso> {
    const ingreso = await this.ingresoRepo.findOne({
      where: { id, fechaEliminacion: IsNull() },
      relations: [
        'contratista',
        'gafete',
        'ingresadoPor',
        'sacadoPor',
        'vehiculo',
        'puntoEntrada',
        'puntoSalida',
      ],
    });

    if (!ingreso) {
      throw new IngresoNoEncontradoException(id);
    }

    return ingreso;
  }

  /**
   * Actualiza un ingreso existente.
   *
   * @remarks
   * Este método está restringido para evitar modificaciones no autorizadas.
   * Solo permite actualizar observaciones y el tipo de autorización.
   *
   * @param id - ID del ingreso a actualizar
   * @param dto - Datos a actualizar
   * @returns El ingreso actualizado
   * @throws {IngresoNoEncontradoException} Si el ingreso no existe
   */
  async update(id: number, dto: UpdateIngresoDto): Promise<Ingreso> {
    const ingreso = await this.findOne(id);

    // ⚠️ Solo permitir actualización de campos seguros
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
   * Calcula el tiempo de estancia de un ingreso.
   *
   * @deprecated Usar el método `calcularDuracion()` de la entidad o el campo en ResponseIngresoDto
   * @param ingresoId - ID del ingreso
   * @returns Duración en formato legible
   */
  async calcularTiempoIngreso(ingresoId: number): Promise<string> {
    const ingreso = await this.findOne(ingresoId);
    return ingreso.calcularDuracion();
  }
}
