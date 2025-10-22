import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ListaNegraService } from './lista-negra.service';
import { CreateListaNegraDto } from './dto/create-lista-negra.dto';
import { UpdateListaNegraDto } from './dto/update-lista-negra.dto';

@Controller('lista-negra')
export class ListaNegraController {
  constructor(private readonly listaNegraService: ListaNegraService) {}

  @Post()
  crear(@Body() dto: CreateListaNegraDto) {
    return this.listaNegraService.crear(dto);
  }

  @Get()
  obtenerTodos() {
    return this.listaNegraService.obtenerTodos();
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.listaNegraService.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateListaNegraDto) {
    return this.listaNegraService.actualizar(id, dto);
  }

  @Patch(':id/retirar')
  retirar(@Param('id', ParseIntPipe) id: number) {
    return this.listaNegraService.retirar(id);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.listaNegraService.eliminar(id);
  }
}
