import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GafetesService } from './gafetes.service';
import { CreateGafeteDto } from './dto/create-gafete.dto';
import { UpdateGafeteDto } from './dto/update-gafete.dto';
import { ResponseGafeteDto } from './dto/response-gafete.dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { EstadoGafete } from '@common/enums/gafete-estado.enum';

@ApiTags('gafetes')
@Controller('gafetes')
@UseInterceptors(ClassSerializerInterceptor)
export class GafetesController {
  constructor(private readonly gafetesService: GafetesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo gafete' })
  @ApiResponse({ status: 201, type: ResponseGafeteDto })
  async create(@Body() dto: CreateGafeteDto) {
    const gafete = await this.gafetesService.create(dto);
    return plainToInstance(ResponseGafeteDto, gafete);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los gafetes' })
  @ApiResponse({ status: 200, type: [ResponseGafeteDto] })
  async findAll() {
    const gafetes = await this.gafetesService.findAll();
    return plainToInstance(ResponseGafeteDto, gafetes);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un gafete por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseGafeteDto })
  async findOne(@Param('id') id: number) {
    const gafete = await this.gafetesService.findOne(id);
    return plainToInstance(ResponseGafeteDto, gafete);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un gafete por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateGafeteDto })
  @ApiResponse({ status: 200, type: ResponseGafeteDto })
  async update(@Param('id') id: number, @Body() dto: UpdateGafeteDto) {
    const gafete = await this.gafetesService.update(id, dto);
    return plainToInstance(ResponseGafeteDto, gafete);
  }

  @Patch('estado/:id')
  @ApiOperation({ summary: 'Cambiar el estado de un gafete' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    schema: { type: 'object', properties: { estado: { enum: Object.values(EstadoGafete) } } },
  })
  @ApiResponse({ status: 200, type: ResponseGafeteDto })
  async cambiarEstado(@Param('id') id: number, @Body('estado') estado: EstadoGafete) {
    const gafete = await this.gafetesService.cambiarEstado(id, estado);
    return plainToInstance(ResponseGafeteDto, gafete);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un gafete (soft delete)' })
  async remove(@Param('id') id: number) {
    await this.gafetesService.softDelete(id);
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restaurar un gafete eliminado' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseGafeteDto })
  async restore(@Param('id') id: number) {
    const gafete = await this.gafetesService.restore(id);
    return plainToInstance(ResponseGafeteDto, gafete);
  }

  @Get('pendientes')
  @ApiOperation({ summary: 'Listar todos los gafetes pendientes (no devueltos)' })
  @ApiResponse({ status: 200, type: [ResponseGafeteDto] })
  async pendientes() {
    const pendientes = await this.gafetesService.pendientes();
    return pendientes;
  }
}
