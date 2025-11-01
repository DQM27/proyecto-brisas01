import { EstadoDevolucionGafete } from '@common/enums/estado-devolucion-gafete.enum';
import { TipoAutorizacion } from '@common/enums/tipo-autorizacion.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { HistorialGafete } from '../gafetes/entities/historial-gafete.entity';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { Ingreso } from './entities/ingreso.entity';
import { IngresoValidationService } from './ingreso-validation.service';
import { IngresoNoEncontradoException } from './ingresos.exceptions';
import { IngresosService } from './ingresos.service';

describe('IngresosService', () => {
  let service: IngresosService;
  let ingresoRepo: Repository<Ingreso>;
  let historialRepo: Repository<HistorialGafete>;
  let dataSource: DataSource;
  let validationService: IngresoValidationService;
  let queryRunner: QueryRunner;

  // Mocks reales
  const mockContratista = {
    id: 1,
    primerNombre: 'Juan',
    segundoNombre: 'Carlos',
    primerApellido: 'Pérez',
    segundoApellido: 'González',
    cedula: '123456789',
    empresa: { id: 1, nombre: 'Constructora ABC' },
  };

  const mockUsuario = {
    id: 1,
    primerNombre: 'María',
    primerApellido: 'García',
  };

  const mockGafete = {
    id: 1,
    codigo: 'GAF-001',
    estado: 'ACTIVO',
  };

  const mockIngreso = {
    id: 1,
    contratista: mockContratista,
    gafete: mockGafete,
    tipoAutorizacion: TipoAutorizacion.AUTOMATICA,
    fechaIngreso: new Date('2025-10-28T08:00:00.000Z'),
    dentroFuera: true,
    ingresadoPor: mockUsuario,
    calcularDuracion: () => '2h 30m 15s',
  } as any;

  beforeEach(async () => {
    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
      },
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const mockIngresoRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
    };

    const mockHistorialRepo = {
      save: jest.fn(),
    };

    const mockValidationService = {
      validarYObtenerContratista: jest.fn(),
      validarReglasNegocioIngreso: jest.fn(),
      validarYObtenerGafete: jest.fn(),
      validarYObtenerUsuario: jest.fn(),
      validarYObtenerIngresoActivo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngresosService,
        { provide: getRepositoryToken(Ingreso), useValue: mockIngresoRepo },
        { provide: getRepositoryToken(HistorialGafete), useValue: mockHistorialRepo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: IngresoValidationService, useValue: mockValidationService },
      ],
    }).compile();

    service = module.get<IngresosService>(IngresosService);
    ingresoRepo = module.get(getRepositoryToken(Ingreso));
    historialRepo = module.get(getRepositoryToken(HistorialGafete));
    dataSource = module.get(DataSource);
    validationService = module.get(IngresoValidationService);
    queryRunner = dataSource.createQueryRunner();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registrarIngreso', () => {
    const dto: CreateIngresoDto = {
      contratistaId: 1,
      gafeteId: 1,
      tipoAutorizacion: TipoAutorizacion.AUTOMATICA,
      observaciones: 'Test',
    };

    it('debe registrar ingreso con gafete', async () => {
      validationService.validarYObtenerContratista.mockResolvedValue(mockContratista as any);
      validationService.validarReglasNegocioIngreso.mockResolvedValue(undefined);
      validationService.validarYObtenerGafete.mockResolvedValue(mockGafete as any);
      validationService.validarYObtenerUsuario.mockResolvedValue(mockUsuario as any);

      const savedIngreso = { ...mockIngreso, id: 1 };
      const historial = { id: 1, ingreso: savedIngreso };

      queryRunner.manager.create.mockReturnValueOnce(savedIngreso).mockReturnValueOnce(historial);
      queryRunner.manager.save.mockResolvedValueOnce(savedIngreso).mockResolvedValueOnce(historial);

      jest.spyOn(service, 'findOne').mockResolvedValue(savedIngreso);

      const result = await service.registrarIngreso(dto, 1);

      expect(queryRunner.manager.create).toHaveBeenCalledTimes(2);
      expect(queryRunner.manager.save).toHaveBeenCalledTimes(2);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(savedIngreso);
    });

    it('debe registrar ingreso sin gafete', async () => {
      const dtoSinGafete = { ...dto, gafeteId: undefined };
      validationService.validarYObtenerGafete.mockResolvedValue(null);

      const savedIngreso = { ...mockIngreso, id: 1, gafete: null };
      queryRunner.manager.create.mockReturnValueOnce(savedIngreso);
      queryRunner.manager.save.mockResolvedValueOnce(savedIngreso);
      jest.spyOn(service, 'findOne').mockResolvedValue(savedIngreso);

      await service.registrarIngreso(dtoSinGafete, 1);

      expect(queryRunner.manager.create).toHaveBeenCalledTimes(1);
      expect(queryRunner.manager.save).toHaveBeenCalledTimes(1);
    });

    it('debe hacer rollback si falla', async () => {
      validationService.validarReglasNegocioIngreso.mockRejectedValue(new Error('Fail'));

      await expect(service.registrarIngreso(dto, 1)).rejects.toThrow('Fail');
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('registrarSalida', () => {
    it('debe registrar salida con gafete', async () => {
      const ingresoActivo = { ...mockIngreso, dentroFuera: true };
      const historial = { id: 1, estadoDevolucion: EstadoDevolucionGafete.BUENO };

      validationService.validarYObtenerIngresoActivo.mockResolvedValue(ingresoActivo);
      validationService.validarYObtenerUsuario.mockResolvedValue(mockUsuario as any);

      queryRunner.manager.save.mockResolvedValueOnce({ ...ingresoActivo, dentroFuera: false });
      queryRunner.manager.findOne.mockResolvedValue(historial);
      queryRunner.manager.save.mockResolvedValueOnce(historial);

      jest.spyOn(service, 'findOne').mockResolvedValue({ ...ingresoActivo, dentroFuera: false });

      const result = await service.registrarSalida(1, 1, EstadoDevolucionGafete.BUENO);

      expect(queryRunner.manager.save).toHaveBeenCalledTimes(2);
      expect(result.dentroFuera).toBe(false);
    });
  });

  describe('findAll', () => {
    it('debe retornar paginación con select', async () => {
      const data = [mockIngreso];
      ingresoRepo.findAndCount.mockResolvedValue([data as any, 1]);

      const result = await service.findAll(1, 50);

      expect(ingresoRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            ingresadoPor: { id: true, primerNombre: true, primerApellido: true },
          }),
          take: 50,
          skip: 0,
        }),
      );

      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('debe retornar ingreso con select', async () => {
      ingresoRepo.findOne.mockResolvedValue(mockIngreso);

      await service.findOne(1);

      expect(ingresoRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            ingresadoPor: { id: true, primerNombre: true, primerApellido: true },
          }),
        }),
      );
    });

    it('debe lanzar excepción si no existe', async () => {
      ingresoRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(IngresoNoEncontradoException);
    });
  });

  describe('update', () => {
    it('debe actualizar solo campos permitidos', async () => {
      const dto: UpdateIngresoDto = { observaciones: 'nuevo' };
      const ingreso = { ...mockIngreso };

      jest.spyOn(service, 'findOne').mockResolvedValue(ingreso);
      ingresoRepo.save.mockResolvedValue({ ...ingreso, observaciones: 'nuevo' });
      jest.spyOn(service, 'findOne').mockResolvedValue({ ...ingreso, observaciones: 'nuevo' });

      const result = await service.update(1, dto);

      expect(result.observaciones).toBe('nuevo');
    });
  });

  describe('calcularTiempoIngreso', () => {
    it('debe usar calcularDuracion', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockIngreso);

      const result = await service.calcularTiempoIngreso(1);

      expect(result).toBe('2h 30m 15s');
    });
  });
});
