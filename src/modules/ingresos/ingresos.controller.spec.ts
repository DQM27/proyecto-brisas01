import { TipoAutorizacion } from '@common/enums/tipo-autorizacion.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { IngresosController } from './ingresos.controller';
import { IngresosService } from './ingresos.service';

describe('IngresosController (unit)', () => {
  let controller: IngresosController;
  let service: IngresosService;

  const mockIngreso = {
    id: 1,
    contratista: {
      id: 1,
      nombreCompleto: 'Juan Pérez',
      cedula: '123456789',
      primerNombre: 'Juan',
      primerApellido: 'Pérez',
      empresa: { id: 1, nombre: 'ABC S.A.' },
    },
    tipoAutorizacion: TipoAutorizacion.AUTOMATICA,
    fechaIngreso: new Date(),
    dentroFuera: true,
    ingresadoPor: { id: 1, nombreCompleto: 'Usuario 1' }, // ← CORREGIDO
    sacadoPor: null,
    duracion: '0h 0m 0s',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngresosController],
      providers: [
        {
          provide: IngresosService,
          useValue: {
            registrarIngreso: jest.fn(),
            registrarSalida: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IngresosController>(IngresosController);
    service = module.get<IngresosService>(IngresosService);
  });

  describe('registrarIngreso', () => {
    it('debe registrar ingreso exitosamente', async () => {
      const dto: CreateIngresoDto = {
        contratistaId: 1,
        tipoAutorizacion: TipoAutorizacion.AUTOMATICA,
      };

      jest.spyOn(service, 'registrarIngreso').mockResolvedValue(mockIngreso as any);

      const result = await controller.registrarIngreso({ usuarioId: 1 }, dto);

      expect(result.contratista.nombreCompleto).toBe('Juan Pérez');
      expect(result.ingresadoPor.nombreCompleto).toBe('Usuario 1'); // ← CORREGIDO
    });

    it('debe lanzar error si falta usuarioId', async () => {
      const dto: CreateIngresoDto = {
        contratistaId: 1,
        tipoAutorizacion: TipoAutorizacion.AUTOMATICA,
      };

      await expect(controller.registrarIngreso({}, dto)).rejects.toThrow();
    });
  });

  describe('registrarSalida', () => {
    it('debe registrar salida', async () => {
      const salida = { ...mockIngreso, dentroFuera: false, fechaSalida: new Date() };
      jest.spyOn(service, 'registrarSalida').mockResolvedValue(salida as any);

      const result = await controller.registrarSalida({ usuarioId: 1 }, 1);

      expect(result.dentroFuera).toBe(false);
    });
  });

  describe('findAll', () => {
    it('debe listar ingresos paginados', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue({
        data: [mockIngreso],
        total: 1,
        page: 1,
        totalPages: 1,
      });

      const result = await controller.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].ingresadoPor.nombreCompleto).toBe('Usuario 1'); // ← CORREGIDO
    });
  });

  describe('findOne', () => {
    it('debe obtener un ingreso', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockIngreso as any);

      const result = await controller.findOne(1);

      expect(result.ingresadoPor.nombreCompleto).toBe('Usuario 1'); // ← CORREGIDO
    });
  });

  describe('update', () => {
    it('debe actualizar ingreso', async () => {
      const updated = { ...mockIngreso, observaciones: 'Actualizado' };
      jest.spyOn(service, 'update').mockResolvedValue(updated as any);

      const result = await controller.update(1, { observaciones: 'Actualizado' });

      expect(result.observaciones).toBe('Actualizado');
    });
  });
});
