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
import { ListaNegraService } from './lista-negra.service';
import { CreateListaNegraDto } from './dto/create-lista-negra.dto';
import { UpdateListaNegraDto } from './dto/update-lista-negra.dto';
import { ResponseListaNegraDto } from './dto/response-lista-negra.dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('lista-negra')
@Controller('lista-negra')
@UseInterceptors(ClassSerializerInterceptor)
export class ListaNegraController {
  constructor(private readonly listaNegraService: ListaNegraService) {}

  @Post()
  @ApiOperation({ summary: 'Agregar un registro a la lista negra' })
  @ApiResponse({ status: 201, type: ResponseListaNegraDto })
  async crear(@Body() dto: CreateListaNegraDto) {
    const item = await this.listaNegraService.crear(dto);
    return plainToInstance(ResponseListaNegraDto, item);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los registros de la lista negra' })
  @ApiResponse({ status: 200, type: [ResponseListaNegraDto] })
  async obtenerTodos() {
    const items = await this.listaNegraService.obtenerTodos();
    return plainToInstance(ResponseListaNegraDto, items);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de la lista negra por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseListaNegraDto })
  async obtenerUno(@Param('id', ParseIntPipe) id: number) {
    const item = await this.listaNegraService.obtenerUno(id);
    return plainToInstance(ResponseListaNegraDto, item);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro de la lista negra' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseListaNegraDto })
  async actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateListaNegraDto) {
    const item = await this.listaNegraService.actualizar(id, dto);
    return plainToInstance(ResponseListaNegraDto, item);
  }

  @Patch(':id/retirar')
  @ApiOperation({ summary: 'Retirar un registro de la lista negra (soft delete)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseListaNegraDto })
  async retirar(@Param('id', ParseIntPipe) id: number) {
    const item = await this.listaNegraService.retirar(id);
    return plainToInstance(ResponseListaNegraDto, item);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un registro de la lista negra permanentemente' })
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.listaNegraService.eliminar(id);
  }
}
