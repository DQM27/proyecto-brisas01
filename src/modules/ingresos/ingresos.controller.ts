import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { IngresosService } from './ingresos.service';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { ResponseIngresoDto } from './dto/response-ingreso.dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('ingresos')
@Controller('ingresos')
@UseInterceptors(ClassSerializerInterceptor)
export class IngresosController {
  constructor(private readonly ingresosService: IngresosService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar ingreso de un contratista' })
  @ApiQuery({ name: 'usuarioId', type: Number, required: true })
  @ApiResponse({ status: 201, type: ResponseIngresoDto })
  async registrarIngreso(
    @Body() dto: CreateIngresoDto,
    @Query('usuarioId') usuarioId: number, // transformación automática gracias a ValidationPipe
  ) {
    const ingreso = await this.ingresosService.registrarIngreso(dto, usuarioId);
    return plainToInstance(ResponseIngresoDto, ingreso);
  }

  @Patch(':contratistaId/salida')
  @ApiOperation({ summary: 'Registrar salida de un contratista' })
  @ApiParam({ name: 'contratistaId', type: Number })
  @ApiQuery({ name: 'usuarioId', type: Number, required: true })
  @ApiResponse({ status: 200, type: ResponseIngresoDto })
  async registrarSalida(
    @Param('contratistaId') contratistaId: number, // transformación automática
    @Query('usuarioId') usuarioId: number, // transformación automática
  ) {
    const ingreso = await this.ingresosService.registrarSalida(contratistaId, usuarioId);
    return plainToInstance(ResponseIngresoDto, ingreso);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los ingresos' })
  @ApiResponse({ status: 200, type: [ResponseIngresoDto] })
  async findAll() {
    const ingresos = await this.ingresosService.findAll();
    return plainToInstance(ResponseIngresoDto, ingresos);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ingreso por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseIngresoDto })
  async findOne(@Param('id') id: number) {
    const ingreso = await this.ingresosService.findOne(id);
    return plainToInstance(ResponseIngresoDto, ingreso);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar ingreso por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseIngresoDto })
  async update(@Param('id') id: number, @Body() dto: UpdateIngresoDto) {
    const ingreso = await this.ingresosService.update(id, dto);
    return plainToInstance(ResponseIngresoDto, ingreso);
  }
}
