import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  ContratistaEnListaNegraException,
  ContratistaNoEncontradoException,
  GafeteEnUsoException,
  GafeteNoDisponibleException,
  GafeteNoEncontradoException,
  IngresoActivoExistenteException,
  IngresoActivoNoEncontradoException,
  IngresoNoEncontradoException,
  PraindVencidoException,
  UsuarioNoEncontradoException,
} from './ingresos.exceptions';

describe('Ingresos Exceptions', () => {
  const now = new Date();
  const isoDate = now.toISOString().split('T')[0]; // solo fecha

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('BadRequestException - IngresoException', () => {
    it('ContratistaEnListaNegraException', () => {
      const exception = new ContratistaEnListaNegraException(123);
      expect(exception).toBeInstanceOf(BadRequestException);
      expect(exception.getResponse()).toEqual({
        message: 'El contratista con ID 123 está en lista negra y no puede ingresar.',
        errorCode: 'CONTRATISTA_LISTA_NEGRA',
        timestamp: now.toISOString(),
      });
    });

    it('PraindVencidoException', () => {
      const vencimiento = new Date('2024-01-01');
      const exception = new PraindVencidoException(456, vencimiento);
      expect(exception).toBeInstanceOf(BadRequestException);
      expect(exception.getResponse()).toEqual({
        message: `El Praind del contratista 456 está vencido desde 2024-01-01.`,
        errorCode: 'PRAIND_VENCIDO',
        timestamp: now.toISOString(),
      });
    });

    it('IngresoActivoExistenteException', () => {
      const exception = new IngresoActivoExistenteException(789, 999);
      expect(exception).toBeInstanceOf(BadRequestException);
      expect(exception.getResponse()).toEqual({
        message: 'El contratista 789 ya tiene un ingreso activo (ID: 999).',
        errorCode: 'INGRESO_ACTIVO_EXISTENTE',
        timestamp: now.toISOString(),
      });
    });

    it('GafeteNoDisponibleException', () => {
      const exception = new GafeteNoDisponibleException(10, 'EN_USO');
      expect(exception).toBeInstanceOf(BadRequestException);
      expect(exception.getResponse()).toEqual({
        message: 'El gafete 10 no está disponible. Estado actual: EN_USO.',
        errorCode: 'GAFETE_NO_DISPONIBLE',
        timestamp: now.toISOString(),
      });
    });

    it('GafeteEnUsoException', () => {
      const exception = new GafeteEnUsoException(20, 888);
      expect(exception).toBeInstanceOf(BadRequestException);
      expect(exception.getResponse()).toEqual({
        message: 'El gafete 20 está actualmente en uso en el ingreso 888.',
        errorCode: 'GAFETE_EN_USO',
        timestamp: now.toISOString(),
      });
    });
  });

  describe('NotFoundException', () => {
    it('ContratistaNoEncontradoException', () => {
      const exception = new ContratistaNoEncontradoException(111);
      expect(exception).toBeInstanceOf(NotFoundException);
      expect(exception.getResponse()).toEqual({
        message: 'Contratista con ID 111 no encontrado o inactivo.',
        errorCode: 'CONTRATISTA_NO_ENCONTRADO',
        timestamp: now.toISOString(),
      });
    });

    it('GafeteNoEncontradoException', () => {
      const exception = new GafeteNoEncontradoException(222);
      expect(exception).toBeInstanceOf(NotFoundException);
      expect(exception.getResponse()).toEqual({
        message: 'Gafete con ID 222 no encontrado.',
        errorCode: 'GAFETE_NO_ENCONTRADO',
        timestamp: now.toISOString(),
      });
    });

    it('UsuarioNoEncontradoException', () => {
      const exception = new UsuarioNoEncontradoException(333);
      expect(exception).toBeInstanceOf(NotFoundException);
      expect(exception.getResponse()).toEqual({
        message: 'Usuario con ID 333 no encontrado.',
        errorCode: 'USUARIO_NO_ENCONTRADO',
        timestamp: now.toISOString(),
      });
    });

    it('IngresoActivoNoEncontradoException', () => {
      const exception = new IngresoActivoNoEncontradoException(444);
      expect(exception).toBeInstanceOf(NotFoundException);
      expect(exception.getResponse()).toEqual({
        message: 'No se encontró un ingreso activo para el contratista 444.',
        errorCode: 'INGRESO_ACTIVO_NO_ENCONTRADO',
        timestamp: now.toISOString(),
      });
    });

    it('IngresoNoEncontradoException', () => {
      const exception = new IngresoNoEncontradoException(555);
      expect(exception).toBeInstanceOf(NotFoundException);
      expect(exception.getResponse()).toEqual({
        message: 'Ingreso con ID 555 no encontrado.',
        errorCode: 'INGRESO_NO_ENCONTRADO',
        timestamp: now.toISOString(),
      });
    });
  });
});
