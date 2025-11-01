import { EstadoDevolucionGafete } from '@common/enums/estado-devolucion-gafete.enum';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { ResponseIngresoDto } from './dto/response-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { IngresosService } from './ingresos.service';

/**
 * Controlador para la gestión de ingresos y salidas de contratistas.
 */
@ApiTags('ingresos')
@Controller('ingresos')
@UseInterceptors(ClassSerializerInterceptor)
export class IngresosController {
  constructor(private readonly ingresosService: IngresosService) {}

  /**
   * Registra el ingreso de un contratista.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar ingreso de un contratista',
    description:
      'Registra el ingreso de un contratista validando todas las reglas de negocio (lista negra, Praind, etc.)',
  })
  @ApiQuery({
    name: 'usuarioId',
    type: Number,
    required: true,
    description: 'ID del usuario que registra el ingreso',
    example: 5,
  })
  @ApiResponse({
    status: 201,
    description: 'Ingreso registrado exitosamente',
    type: ResponseIngresoDto,
  })
  @ApiBadRequestResponse({
    description:
      'Validación fallida (contratista en lista negra, Praind vencido, ingreso activo existente, etc.)',
  })
  @ApiNotFoundResponse({
    description: 'Contratista, gafete o usuario no encontrado',
  })
  async registrarIngreso(
    @Body() dto: CreateIngresoDto,
    @Query('usuarioId', ParseIntPipe) usuarioId: number,
  ): Promise<ResponseIngresoDto> {
    const ingreso = await this.ingresosService.registrarIngreso(dto, usuarioId);

    // Construir nombre completo para ingresadoPor
    const buildNombre = (user: any) => {
      if (!user) return null;
      const nombre = `${user.primerNombre || ''} ${user.primerApellido || ''}`.trim();
      return {
        id: user.id,
        nombreCompleto: nombre || `Usuario ${user.id}`,
      };
    };

    const transformed = {
      ...ingreso,
      ingresadoPor: buildNombre(ingreso.ingresadoPor),
      sacadoPor: buildNombre(ingreso.sacadoPor),
    };

    return plainToInstance(ResponseIngresoDto, transformed, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Registra la salida de un contratista.
   */
  @Patch(':contratistaId/salida')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar salida de un contratista',
    description: 'Registra la salida de un contratista que tiene un ingreso activo',
  })
  @ApiParam({
    name: 'contratistaId',
    type: Number,
    description: 'ID del contratista que está saliendo',
    example: 123,
  })
  @ApiQuery({
    name: 'usuarioId',
    type: Number,
    required: true,
    description: 'ID del usuario que registra la salida',
    example: 7,
  })
  @ApiQuery({
    name: 'gafeteEstado',
    enum: EstadoDevolucionGafete,
    required: false,
    description: 'Estado del gafete al momento de la devolución',
    example: EstadoDevolucionGafete.BUENO,
  })
  @ApiResponse({
    status: 200,
    description: 'Salida registrada exitosamente',
    type: ResponseIngresoDto,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró un ingreso activo para el contratista',
  })
  async registrarSalida(
    @Param('contratistaId', ParseIntPipe) contratistaId: number,
    @Query('usuarioId', ParseIntPipe) usuarioId: number,
    @Query('gafeteEstado') gafeteEstado?: EstadoDevolucionGafete,
  ): Promise<ResponseIngresoDto> {
    const ingreso = await this.ingresosService.registrarSalida(
      contratistaId,
      usuarioId,
      gafeteEstado,
    );

    const buildNombre = (user: any) => {
      if (!user) return null;
      const nombre = `${user.primerNombre || ''} ${user.primerApellido || ''}`.trim();
      return {
        id: user.id,
        nombreCompleto: nombre || `Usuario ${user.id}`,
      };
    };

    const transformed = {
      ...ingreso,
      ingresadoPor: buildNombre(ingreso.ingresadoPor),
      sacadoPor: buildNombre(ingreso.sacadoPor),
    };

    return plainToInstance(ResponseIngresoDto, transformed, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Lista todos los ingresos con paginación.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar todos los ingresos',
    description: 'Obtiene una lista paginada de todos los ingresos registrados',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Cantidad de registros por página (máx: 100)',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ingresos obtenida exitosamente',
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/ResponseIngresoDto' } },
        total: { type: 'number', example: 250 },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ): Promise<{
    data: ResponseIngresoDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const maxLimit = Math.min(limit, 100);
    const result = await this.ingresosService.findAll(page, maxLimit);

    // Construir nombre completo para todos los registros
    const buildNombre = (user: any): { id: number; nombreCompleto: string } | null => {
      if (!user) return null;
      const nombre = `${user.primerNombre || ''} ${user.primerApellido || ''}`.trim();
      return {
        id: user.id,
        nombreCompleto: nombre || `Usuario ${user.id}`,
      };
    };

    const dataTransformed = result.data.map((ingreso) => ({
      ...ingreso,
      ingresadoPor: buildNombre(ingreso.ingresadoPor),
      sacadoPor: buildNombre(ingreso.sacadoPor),
    }));

    return {
      ...result,
      data: plainToInstance(ResponseIngresoDto, dataTransformed, {
        excludeExtraneousValues: true,
      }),
    };
  }

  /**
   * Obtiene un ingreso específico por su ID.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener ingreso por ID',
    description: 'Obtiene los detalles completos de un ingreso específico',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del ingreso a buscar',
    example: 42,
  })
  @ApiResponse({
    status: 200,
    description: 'Ingreso encontrado',
    type: ResponseIngresoDto,
  })
  @ApiNotFoundResponse({
    description: 'Ingreso no encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseIngresoDto> {
    const ingreso = await this.ingresosService.findOne(id);

    const buildNombre = (user: any) => {
      if (!user) return null;
      const nombre = `${user.primerNombre || ''} ${user.primerApellido || ''}`.trim();
      return {
        id: user.id,
        nombreCompleto: nombre || `Usuario ${user.id}`,
      };
    };

    const transformed = {
      ...ingreso,
      ingresadoPor: buildNombre(ingreso.ingresadoPor),
      sacadoPor: buildNombre(ingreso.sacadoPor),
    };

    return plainToInstance(ResponseIngresoDto, transformed, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Actualiza un ingreso existente.
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar ingreso por ID',
    description: 'Actualiza campos permitidos de un ingreso (observaciones, tipo de autorización)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del ingreso a actualizar',
    example: 42,
  })
  @ApiResponse({
    status: 200,
    description: 'Ingreso actualizado exitosamente',
    type: ResponseIngresoDto,
  })
  @ApiNotFoundResponse({
    description: 'Ingreso no encontrado',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIngresoDto,
  ): Promise<ResponseIngresoDto> {
    const ingreso = await this.ingresosService.update(id, dto);

    const buildNombre = (user: any) => {
      if (!user) return null;
      const nombre = `${user.primerNombre || ''} ${user.primerApellido || ''}`.trim();
      return {
        id: user.id,
        nombreCompleto: nombre || `Usuario ${user.id}`,
      };
    };

    const transformed = {
      ...ingreso,
      ingresadoPor: buildNombre(ingreso.ingresadoPor),
      sacadoPor: buildNombre(ingreso.sacadoPor),
    };

    return plainToInstance(ResponseIngresoDto, transformed, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Calcula la duración de un ingreso.
   * @deprecated Usar el campo `duracion` en ResponseIngresoDto
   */
  @Get(':id/duracion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calcular duración de un ingreso',
    description: 'Obsoleto: usar el campo `duracion` en la respuesta del ingreso',
    deprecated: true,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del ingreso',
    example: 42,
  })
  @ApiResponse({
    status: 200,
    description: 'Duración calculada',
    schema: {
      properties: {
        duracion: { type: 'string', example: '9h 15m 30s' },
      },
    },
  })
  async calcularDuracion(@Param('id', ParseIntPipe) id: number): Promise<{ duracion: string }> {
    const duracion = await this.ingresosService.calcularTiempoIngreso(id);
    return { duracion };
  }
}
