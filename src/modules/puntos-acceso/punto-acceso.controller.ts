import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PuntoAccesoService } from './punto-acceso.service';
import { CreatePuntoAccesoDto } from './dto/create-punto-acceso.dto';
import { UpdatePuntoAccesoDto } from './dto/update-punto-acceso.dto';
import { ResponsePuntoAccesoDto } from './dto/response-punto-acceso.dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('puntos-acceso')
@Controller('puntos-acceso')
@UseInterceptors(ClassSerializerInterceptor)
export class PuntoAccesoController {
  constructor(private readonly puntoAccesoService: PuntoAccesoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo punto de acceso' })
  @ApiResponse({ status: 201, type: ResponsePuntoAccesoDto })
  async crear(@Body() dto: CreatePuntoAccesoDto) {
    const punto = await this.puntoAccesoService.crear(dto);
    return plainToInstance(ResponsePuntoAccesoDto, punto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los puntos de acceso' })
  @ApiResponse({ status: 200, type: [ResponsePuntoAccesoDto] })
  async obtenerTodos() {
    const puntos = await this.puntoAccesoService.obtenerTodos();
    return plainToInstance(ResponsePuntoAccesoDto, puntos);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un punto de acceso por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponsePuntoAccesoDto })
  async obtenerUno(@Param('id', ParseIntPipe) id: number) {
    const punto = await this.puntoAccesoService.obtenerUno(id);
    return plainToInstance(ResponsePuntoAccesoDto, punto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un punto de acceso' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponsePuntoAccesoDto })
  async actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePuntoAccesoDto) {
    const punto = await this.puntoAccesoService.actualizar(id, dto);
    return plainToInstance(ResponsePuntoAccesoDto, punto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un punto de acceso' })
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.puntoAccesoService.eliminar(id);
  }
}
