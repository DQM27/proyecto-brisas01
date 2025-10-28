import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contratista } from '../contratistas/entities/contratista.entity';
import { Gafete } from '../gafetes/entities/gafete.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Ingreso } from './entities/ingreso.entity';
import { EstadoGafete } from '@common/enums/gafete-estado.enum';
import {
  ContratistaNoEncontradoException,
  ContratistaEnListaNegraException,
  PraindVencidoException,
  IngresoActivoExistenteException,
  GafeteNoEncontradoException,
  GafeteNoDisponibleException,
  GafeteEnUsoException,
  UsuarioNoEncontradoException,
  IngresoActivoNoEncontradoException,
} from './ingresos.exceptions';

/**
 * Servicio dedicado a las validaciones de negocio del módulo de ingresos.
 *
 * @remarks
 * Separar las validaciones en un servicio independiente facilita:
 * - Testing unitario
 * - Reutilización de lógica
 * - Mantenimiento del código
 * - Single Responsibility Principle
 */
@Injectable()
export class IngresoValidationService {
  constructor(
    @InjectRepository(Contratista)
    private readonly contratistaRepo: Repository<Contratista>,

    @InjectRepository(Gafete)
    private readonly gafeteRepo: Repository<Gafete>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(Ingreso)
    private readonly ingresoRepo: Repository<Ingreso>,
  ) {}

  /**
   * Valida y obtiene un contratista verificando que esté activo.
   *
   * @throws {ContratistaNoEncontradoException} Si el contratista no existe o está inactivo
   */
  async validarYObtenerContratista(contratistaId: number): Promise<Contratista> {
    const contratista = await this.contratistaRepo.findOne({
      where: { id: contratistaId, activo: true },
      relations: ['entradasListaNegra', 'ingresos'],
    });

    if (!contratista) {
      throw new ContratistaNoEncontradoException(contratistaId);
    }

    return contratista;
  }

  /**
   * Valida las reglas de negocio para permitir el ingreso de un contratista.
   *
   * @throws {ContratistaEnListaNegraException} Si el contratista está en lista negra
   * @throws {PraindVencidoException} Si el Praind del contratista está vencido
   * @throws {IngresoActivoExistenteException} Si el contratista ya tiene un ingreso activo
   */
  async validarReglasNegocioIngreso(contratista: Contratista): Promise<void> {
    // Validar lista negra
    if (contratista.estaEnListaNegra()) {
      throw new ContratistaEnListaNegraException(contratista.id);
    }

    // Validar Praind
    if (contratista.tienePraindVencido()) {
      // Obtener fecha de vencimiento desde el método o una propiedad alternativa
      const fechaVencimiento =
        (contratista as any).praindVencimiento ||
        (contratista as any).fechaVencimientoPraind ||
        new Date();
      throw new PraindVencidoException(contratista.id, fechaVencimiento);
    }

    // Validar que no tenga un ingreso activo
    const ingresoActivo = await this.ingresoRepo.findOne({
      where: { contratista: { id: contratista.id }, dentroFuera: true },
    });

    if (ingresoActivo) {
      throw new IngresoActivoExistenteException(contratista.id, ingresoActivo.id);
    }
  }

  /**
   * Valida y obtiene un gafete si se proporciona su ID.
   *
   * @param gafeteId - ID del gafete a validar (opcional)
   * @returns El gafete validado o undefined si no se proporcionó ID
   * @throws {GafeteNoEncontradoException} Si el gafete no existe
   * @throws {GafeteNoDisponibleException} Si el gafete no está disponible
   * @throws {GafeteEnUsoException} Si el gafete ya está en uso
   */
  async validarYObtenerGafete(gafeteId?: number): Promise<Gafete | undefined> {
    if (!gafeteId) {
      return undefined;
    }

    const gafete = await this.gafeteRepo.findOne({
      where: { id: gafeteId },
    });

    if (!gafete) {
      throw new GafeteNoEncontradoException(gafeteId);
    }

    if (gafete.estado !== EstadoGafete.ACTIVO) {
      throw new GafeteNoDisponibleException(gafeteId, gafete.estado);
    }

    // Verificar que el gafete no esté en uso
    const gafeteEnUso = await this.ingresoRepo.findOne({
      where: { gafete: { id: gafete.id }, dentroFuera: true },
    });

    if (gafeteEnUso) {
      throw new GafeteEnUsoException(gafete.id, gafeteEnUso.id);
    }

    return gafete;
  }

  /**
   * Valida y obtiene un usuario.
   *
   * @throws {UsuarioNoEncontradoException} Si el usuario no existe
   */
  async validarYObtenerUsuario(usuarioId: number): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new UsuarioNoEncontradoException(usuarioId);
    }

    return usuario;
  }

  /**
   * Valida y obtiene un ingreso activo para un contratista.
   *
   * @throws {IngresoActivoNoEncontradoException} Si no existe un ingreso activo
   */
  async validarYObtenerIngresoActivo(contratistaId: number): Promise<Ingreso> {
    const ingreso = await this.ingresoRepo.findOne({
      where: { contratista: { id: contratistaId }, dentroFuera: true },
      relations: ['contratista', 'gafete'],
    });

    if (!ingreso) {
      throw new IngresoActivoNoEncontradoException(contratistaId);
    }

    return ingreso;
  }
}
