import { TipoAutorizacion } from '@common/enums/tipo-autorizacion.enum';
import { BadRequestException, HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { IngresosController } from './ingresos.controller';
import { IngresosService } from './ingresos.service';

describe('IngresosController (integration)', () => {
  let app: INestApplication;
  let ingresosService: IngresosService;

  // Constantes para IDs de prueba
  const TEST_IDS = {
    USUARIO: 1,
    CONTRATISTA_VALIDO: 1,
    CONTRATISTA_PRAIND_VENCIDO: 2,
    CONTRATISTA_LISTA_NEGRA: 3,
    CONTRATISTA_INGRESO_ACTIVO: 4,
    INGRESO: 1,
  } as const;

  // Factory para crear datos de prueba consistentes
  const createMockIngreso = (overrides = {}) => ({
    id: TEST_IDS.INGRESO,
    contratista: {
      id: 100,
      primerNombre: 'Juan',
      primerApellido: 'Pérez',
      nombreCompleto: 'Juan Pérez',
    },
    tipoAutorizacion: TipoAutorizacion.AUTOMATICA,
    fechaIngreso: new Date('2024-01-01T10:00:00Z'),
    dentroFuera: true,
    ingresadoPor: { id: TEST_IDS.USUARIO, nombreCompleto: 'Usuario 1' },
    sacadoPor: null,
    duracion: '0h 0m 0s',
    ...overrides,
  });

  // Mock del servicio
  const mockIngresosService = {
    registrarIngreso: jest.fn(),
    registrarSalida: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [IngresosController],
      providers: [
        {
          provide: IngresosService,
          useValue: mockIngresosService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    ingresosService = moduleFixture.get<IngresosService>(IngresosService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Limpiar mocks antes de cada prueba para evitar efectos secundarios
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /ingresos', () => {
    const createIngresoDto = {
      contratistaId: TEST_IDS.CONTRATISTA_VALIDO,
      tipoAutorizacion: TipoAutorizacion.AUTOMATICA,
    };

    describe('casos exitosos', () => {
      it('debe registrar un ingreso con Praind válido', async () => {
        const mockIngreso = createMockIngreso();
        mockIngresosService.registrarIngreso.mockResolvedValue(mockIngreso);

        const response = await request(app.getHttpServer())
          .post('/ingresos')
          .query({ usuarioId: TEST_IDS.USUARIO })
          .send(createIngresoDto)
          .expect(HttpStatus.CREATED);

        expect(response.body).toMatchObject({
          contratista: { nombreCompleto: 'Juan Pérez' },
          ingresadoPor: { nombreCompleto: 'Usuario 1' },
          dentroFuera: true,
        });

        expect(mockIngresosService.registrarIngreso).toHaveBeenCalledWith(
          TEST_IDS.USUARIO,
          createIngresoDto,
        );
        expect(mockIngresosService.registrarIngreso).toHaveBeenCalledTimes(1);
      });
    });

    describe('validaciones y casos de error', () => {
      it('debe fallar cuando el Praind está vencido', async () => {
        mockIngresosService.registrarIngreso.mockRejectedValue(
          new BadRequestException({ errorCode: 'PRAIND_VENCIDO' }),
        );

        const response = await request(app.getHttpServer())
          .post('/ingresos')
          .query({ usuarioId: TEST_IDS.USUARIO })
          .send({
            ...createIngresoDto,
            contratistaId: TEST_IDS.CONTRATISTA_PRAIND_VENCIDO,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.errorCode).toBe('PRAIND_VENCIDO');
      });

      it('debe fallar cuando el contratista está en lista negra', async () => {
        mockIngresosService.registrarIngreso.mockRejectedValue(
          new BadRequestException({ errorCode: 'CONTRATISTA_LISTA_NEGRA' }),
        );

        const response = await request(app.getHttpServer())
          .post('/ingresos')
          .query({ usuarioId: TEST_IDS.USUARIO })
          .send({
            ...createIngresoDto,
            contratistaId: TEST_IDS.CONTRATISTA_LISTA_NEGRA,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.errorCode).toBe('CONTRATISTA_LISTA_NEGRA');
      });

      it('debe fallar cuando ya existe un ingreso activo', async () => {
        mockIngresosService.registrarIngreso.mockRejectedValue(
          new BadRequestException({ errorCode: 'INGRESO_ACTIVO' }),
        );

        const response = await request(app.getHttpServer())
          .post('/ingresos')
          .query({ usuarioId: TEST_IDS.USUARIO })
          .send({
            ...createIngresoDto,
            contratistaId: TEST_IDS.CONTRATISTA_INGRESO_ACTIVO,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.errorCode).toBe('INGRESO_ACTIVO');
      });
    });
  });

  describe('PATCH /ingresos/:id/salida', () => {
    it('debe registrar la salida de un contratista', async () => {
      const mockSalida = createMockIngreso({
        dentroFuera: false,
        fechaSalida: new Date('2024-01-01T18:00:00Z'),
        sacadoPor: { id: TEST_IDS.USUARIO, nombreCompleto: 'Usuario 1' },
        duracion: '8h 0m 0s',
      });

      mockIngresosService.registrarSalida.mockResolvedValue(mockSalida);

      const response = await request(app.getHttpServer())
        .patch(`/ingresos/${TEST_IDS.INGRESO}/salida`)
        .query({ usuarioId: TEST_IDS.USUARIO })
        .expect(HttpStatus.OK);

      expect(response.body.dentroFuera).toBe(false);
      expect(response.body.sacadoPor).toBeDefined();
      expect(mockIngresosService.registrarSalida).toHaveBeenCalledWith(
        TEST_IDS.INGRESO,
        TEST_IDS.USUARIO,
      );
    });
  });

  describe('GET /ingresos', () => {
    it('debe listar ingresos con paginación', async () => {
      const mockPaginatedResponse = {
        data: [createMockIngreso()],
        total: 1,
        page: 1,
        totalPages: 1,
      };

      mockIngresosService.findAll.mockResolvedValue(mockPaginatedResponse);

      const response = await request(app.getHttpServer()).get('/ingresos').expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            ingresadoPor: { nombreCompleto: 'Usuario 1' },
          }),
        ]),
        total: 1,
        page: 1,
      });

      expect(mockIngresosService.findAll).toHaveBeenCalledTimes(1);
    });

    it('debe aplicar filtros correctamente', async () => {
      const mockPaginatedResponse = {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };

      mockIngresosService.findAll.mockResolvedValue(mockPaginatedResponse);

      await request(app.getHttpServer())
        .get('/ingresos')
        .query({ page: 2, limit: 10, dentroFuera: true })
        .expect(HttpStatus.OK);

      expect(mockIngresosService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: '2',
          limit: '10',
          dentroFuera: 'true',
        }),
      );
    });
  });

  describe('GET /ingresos/:id', () => {
    it('debe obtener un ingreso específico', async () => {
      const mockIngreso = createMockIngreso();
      mockIngresosService.findOne.mockResolvedValue(mockIngreso);

      const response = await request(app.getHttpServer())
        .get(`/ingresos/${TEST_IDS.INGRESO}`)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        id: TEST_IDS.INGRESO,
        ingresadoPor: { nombreCompleto: 'Usuario 1' },
      });

      expect(mockIngresosService.findOne).toHaveBeenCalledWith(TEST_IDS.INGRESO);
    });
  });

  describe('PATCH /ingresos/:id', () => {
    it('debe actualizar las observaciones de un ingreso', async () => {
      const updateDto = { observaciones: 'Visita técnica programada' };
      const mockUpdatedIngreso = createMockIngreso(updateDto);

      mockIngresosService.update.mockResolvedValue(mockUpdatedIngreso);

      const response = await request(app.getHttpServer())
        .patch(`/ingresos/${TEST_IDS.INGRESO}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body.observaciones).toBe(updateDto.observaciones);
      expect(mockIngresosService.update).toHaveBeenCalledWith(TEST_IDS.INGRESO, updateDto);
    });

    it('debe actualizar el tipo de autorización', async () => {
      const updateDto = { tipoAutorizacion: TipoAutorizacion.MANUAL };
      const mockUpdatedIngreso = createMockIngreso(updateDto);

      mockIngresosService.update.mockResolvedValue(mockUpdatedIngreso);

      const response = await request(app.getHttpServer())
        .patch(`/ingresos/${TEST_IDS.INGRESO}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body.tipoAutorizacion).toBe(TipoAutorizacion.MANUAL);
    });
  });
});
