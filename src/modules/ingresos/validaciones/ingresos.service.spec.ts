import { EstadoGafete } from '@common/enums/gafete-estado.enum';
import { TipoAutorizacion } from '@common/enums/tipo-autorizacion.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Contratista } from '../../contratistas/entities/contratista.entity';
import { Gafete } from '../../gafetes/entities/gafete.entity';
import { HistorialGafete } from '../../gafetes/entities/historial-gafete.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Ingreso } from '../entities/ingreso.entity';
import { IngresoValidationService } from '../ingreso-validation.service';
import { ContratistaNoEncontradoException } from '../ingresos.exceptions';
import { IngresosService } from '../ingresos.service';

/**
 * Suite de tests unitarios para IngresosService.
 *
 * @remarks
 * Estos tests validan la lógica de negocio del servicio usando mocks
 * para las dependencias. No requieren una base de datos real.
 *
 * Cobertura:
 * - Registro de ingresos exitoso
 * - Validaciones de negocio
 * - Manejo de transacciones
 * - Registro de salidas
 * - Casos de error
 */
describe('IngresosService', () => {
  let service: IngresosService;
  let ingresoRepo: Repository<Ingreso>;
  let historialRepo: Repository<HistorialGafete>;
  let validationService: IngresoValidationService;
  let dataSource: DataSource;

  // Mock de QueryRunner para simular transacciones
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngresosService,
        {
          provide: getRepositoryToken(Ingreso),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(HistorialGafete),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => mockQueryRunner),
          },
        },
        {
          provide: IngresoValidationService,
          useValue: {
            validarYObtenerContratista: jest.fn(),
            validarReglasNegocioIngreso: jest.fn(),
            validarYObtenerGafete: jest.fn(),
            validarYObtenerUsuario: jest.fn(),
            validarYObtenerIngresoActivo: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IngresosService>(IngresosService);
    ingresoRepo = module.get<Repository<Ingreso>>(getRepositoryToken(Ingreso));
    historialRepo = module.get<Repository<HistorialGafete>>(getRepositoryToken(HistorialGafete));
    validationService = module.get<IngresoValidationService>(IngresoValidationService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registrarIngreso', () => {
    it('debe registrar un ingreso exitosamente con gafete', async () => {
      // Arrange
      const dto = {
        contratistaId: 1,
        gafeteId: 5,
        tipoAutorizacion: TipoAutorizacion.AUTOMATICA,
      };
      const usuarioId = 10;

      const mockContratista = { id: 1, nombre: 'Test' } as Contratista;
      const mockGafete = { id: 5, codigo: 'GAF-001', estado: EstadoGafete.ACTIVO } as Gafete;
      const mockUsuario = { id: 10, nombreCompleto: 'Usuario Test' } as Usuario;
      const mockIngreso = { id: 100, ...dto } as Ingreso;

      jest
        .spyOn(validationService, 'validarYObtenerContratista')
        .mockResolvedValue(mockContratista);
      jest.spyOn(validationService, 'validarReglasNegocioIngreso').mockResolvedValue();
      jest.spyOn(validationService, 'validarYObtenerGafete').mockResolvedValue(mockGafete);
      jest.spyOn(validationService, 'validarYObtenerUsuario').mockResolvedValue(mockUsuario);

      mockQueryRunner.manager.create.mockReturnValue(mockIngreso);
      mockQueryRunner.manager.save.mockResolvedValue(mockIngreso);

      jest.spyOn(service, 'findOne').mockResolvedValue(mockIngreso);

      // Act
      const result = await service.registrarIngreso(dto, usuarioId);

      // Assert
      expect(result).toBeDefined();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(validationService.validarYObtenerContratista).toHaveBeenCalledWith(dto.contratistaId);
    });

    it('debe hacer rollback si falla la creación del historial', async () => {
      // Arrange
      const dto = { contratistaId: 1, gafeteId: 5 };
      const usuarioId = 10;

      const mockContratista = { id: 1 } as Contratista;
      const mockGafete = { id: 5, codigo: 'GAF-001' } as Gafete;
      const mockUsuario = { id: 10 } as Usuario;

      jest
        .spyOn(validationService, 'validarYObtenerContratista')
        .mockResolvedValue(mockContratista);
      jest.spyOn(validationService, 'validarReglasNegocioIngreso').mockResolvedValue();
      jest.spyOn(validationService, 'validarYObtenerGafete').mockResolvedValue(mockGafete);
      jest.spyOn(validationService, 'validarYObtenerUsuario').mockResolvedValue(mockUsuario);

      mockQueryRunner.manager.save.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(service.registrarIngreso(dto, usuarioId)).rejects.toThrow('Database error');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('debe lanzar excepción si el contratista no existe', async () => {
      // Arrange
      const dto = { contratistaId: 999 };
      const usuarioId = 10;

      jest
        .spyOn(validationService, 'validarYObtenerContratista')
        .mockRejectedValue(new ContratistaNoEncontradoException(999));

      // Act & Assert
      await expect(service.registrarIngreso(dto, usuarioId)).rejects.toThrow(
        ContratistaNoEncontradoException,
      );
    });
  });

  describe('registrarSalida', () => {
    it('debe registrar la salida exitosamente', async () => {
      // Arrange
      const contratistaId = 1;
      const usuarioId = 10;

      const mockIngreso = {
        id: 100,
        contratista: { id: contratistaId },
        gafete: { id: 5 },
        dentroFuera: true,
      } as Ingreso;

      const mockUsuario = { id: 10 } as Usuario;

      jest.spyOn(validationService, 'validarYObtenerIngresoActivo').mockResolvedValue(mockIngreso);
      jest.spyOn(validationService, 'validarYObtenerUsuario').mockResolvedValue(mockUsuario);

      mockQueryRunner.manager.save.mockResolvedValue({ ...mockIngreso, dentroFuera: false });
      jest.spyOn(service, 'findOne').mockResolvedValue(mockIngreso);

      // Act
      const result = await service.registrarSalida(contratistaId, usuarioId);

      // Assert
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('debe retornar ingresos paginados', async () => {
      // Arrange
      const mockIngresos = [
        { id: 1, contratistaId: 1 },
        { id: 2, contratistaId: 2 },
      ] as Ingreso[];

      jest.spyOn(ingresoRepo, 'findAndCount').mockResolvedValue([mockIngresos, 2]);

      // Act
      const result = await service.findAll(1, 10);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });
});
