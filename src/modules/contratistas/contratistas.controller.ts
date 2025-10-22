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
} from '@nestjs/common';
import { ContratistasService } from './contratistas.service';
import { CreateContratistaDto } from './dto/create-contratista.dto';
import { UpdateContratistaDto } from './dto/update-contratista.dto';

@Controller('contratistas')
export class ContratistasController {
  constructor(private readonly contratistasService: ContratistasService) {}

  /**
   * Crear un nuevo contratista
   */
  @Post()
  async create(@Body() dto: CreateContratistaDto) {
    return this.contratistasService.create(dto);
  }

  /**
   * Obtener todos los contratistas activos
   */
  @Get()
  async findAll() {
    return this.contratistasService.findAll();
  }

  /**
   * Obtener un contratista por ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contratistasService.findOne(id);
  }

  /**
   * Actualizar un contratista
   */
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContratistaDto) {
    return this.contratistasService.update(id, dto);
  }

  /**
   * Eliminación lógica (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.contratistasService.softDelete(id);
  }

  /**
   * Restaurar un contratista eliminado
   */
  @Patch(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.contratistasService.restore(id);
  }
}
