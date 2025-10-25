import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ContratistasService } from './contratistas.service';
import { CreateContratistaDto } from './dto/create-contratista.dto';
import { UpdateContratistaDto } from './dto/update-contratista.dto';
import { ResponseContratistaDto } from './dto/response-contratista.dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('contratistas')
@Controller('contratistas')
@UseInterceptors(ClassSerializerInterceptor)
export class ContratistasController {
  constructor(private readonly contratistasService: ContratistasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo contratista' })
  @ApiResponse({ status: 201, type: ResponseContratistaDto })
  async create(@Body() dto: CreateContratistaDto) {
    const contratista = await this.contratistasService.create(dto);
    return plainToInstance(ResponseContratistaDto, contratista);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los contratistas' })
  @ApiResponse({ status: 200, type: [ResponseContratistaDto] })
  async findAll() {
    const contratistas = await this.contratistasService.findAll();
    return plainToInstance(ResponseContratistaDto, contratistas);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un contratista por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseContratistaDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const contratista = await this.contratistasService.findOne(id);
    return plainToInstance(ResponseContratistaDto, contratista);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un contratista' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseContratistaDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContratistaDto) {
    const contratista = await this.contratistasService.update(id, dto);
    return plainToInstance(ResponseContratistaDto, contratista);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un contratista (soft delete)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.contratistasService.softDelete(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar un contratista eliminado' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseContratistaDto })
  async restore(@Param('id', ParseIntPipe) id: number) {
    const contratista = await this.contratistasService.restore(id);
    return plainToInstance(ResponseContratistaDto, contratista);
  }
}
