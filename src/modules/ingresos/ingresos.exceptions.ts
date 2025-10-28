import { BadRequestException, NotFoundException } from '@nestjs/common';

/**
 * Excepción base para errores relacionados con el módulo de ingresos.
 */
export class IngresoException extends BadRequestException {
  constructor(
    message: string,
    public readonly errorCode?: string,
  ) {
    super({
      message,
      errorCode,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Se lanza cuando un contratista intenta ingresar estando en lista negra.
 */
export class ContratistaEnListaNegraException extends IngresoException {
  constructor(contratistaId: number) {
    super(
      `El contratista con ID ${contratistaId} está en lista negra y no puede ingresar.`,
      'CONTRATISTA_LISTA_NEGRA',
    );
  }
}

/**
 * Se lanza cuando un contratista intenta ingresar con Praind vencido.
 */
export class PraindVencidoException extends IngresoException {
  constructor(contratistaId: number, fechaVencimiento: Date) {
    super(
      `El Praind del contratista ${contratistaId} está vencido desde ${fechaVencimiento.toLocaleDateString()}.`,
      'PRAIND_VENCIDO',
    );
  }
}

/**
 * Se lanza cuando un contratista intenta ingresar teniendo un ingreso activo.
 */
export class IngresoActivoExistenteException extends IngresoException {
  constructor(contratistaId: number, ingresoActivoId: number) {
    super(
      `El contratista ${contratistaId} ya tiene un ingreso activo (ID: ${ingresoActivoId}).`,
      'INGRESO_ACTIVO_EXISTENTE',
    );
  }
}

/**
 * Se lanza cuando se intenta usar un gafete que no está disponible.
 */
export class GafeteNoDisponibleException extends IngresoException {
  constructor(gafeteId: number, estadoActual: string) {
    super(
      `El gafete ${gafeteId} no está disponible. Estado actual: ${estadoActual}.`,
      'GAFETE_NO_DISPONIBLE',
    );
  }
}

/**
 * Se lanza cuando se intenta usar un gafete que ya está en uso.
 */
export class GafeteEnUsoException extends IngresoException {
  constructor(gafeteId: number, ingresoId: number) {
    super(
      `El gafete ${gafeteId} está actualmente en uso en el ingreso ${ingresoId}.`,
      'GAFETE_EN_USO',
    );
  }
}

/**
 * Se lanza cuando no se encuentra un contratista.
 */
export class ContratistaNoEncontradoException extends NotFoundException {
  constructor(contratistaId: number) {
    super({
      message: `Contratista con ID ${contratistaId} no encontrado o inactivo.`,
      errorCode: 'CONTRATISTA_NO_ENCONTRADO',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Se lanza cuando no se encuentra un gafete.
 */
export class GafeteNoEncontradoException extends NotFoundException {
  constructor(gafeteId: number) {
    super({
      message: `Gafete con ID ${gafeteId} no encontrado.`,
      errorCode: 'GAFETE_NO_ENCONTRADO',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Se lanza cuando no se encuentra un usuario.
 */
export class UsuarioNoEncontradoException extends NotFoundException {
  constructor(usuarioId: number) {
    super({
      message: `Usuario con ID ${usuarioId} no encontrado.`,
      errorCode: 'USUARIO_NO_ENCONTRADO',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Se lanza cuando no se encuentra un ingreso activo para registrar salida.
 */
export class IngresoActivoNoEncontradoException extends NotFoundException {
  constructor(contratistaId: number) {
    super({
      message: `No se encontró un ingreso activo para el contratista ${contratistaId}.`,
      errorCode: 'INGRESO_ACTIVO_NO_ENCONTRADO',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Se lanza cuando no se encuentra un ingreso específico.
 */
export class IngresoNoEncontradoException extends NotFoundException {
  constructor(ingresoId: number) {
    super({
      message: `Ingreso con ID ${ingresoId} no encontrado.`,
      errorCode: 'INGRESO_NO_ENCONTRADO',
      timestamp: new Date().toISOString(),
    });
  }
}
