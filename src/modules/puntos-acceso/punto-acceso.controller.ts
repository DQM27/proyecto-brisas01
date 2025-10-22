import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { PuntoAccesoService } from './punto-acceso.service';
import { CreatePuntoAccesoDto } from './dto/create-punto-acceso.dto';
import { UpdatePuntoAccesoDto } from './dto/update-punto-acceso.dto';

@Controller('puntos-acceso')
export class PuntoAccesoController {
  constructor(private readonly puntoAccesoService: PuntoAccesoService) {}

  @Post()
  crear(@Body() dto: CreatePuntoAccesoDto) {
    return this.puntoAccesoService.crear(dto);
  }

  @Get()
  obtenerTodos() {
    return this.puntoAccesoService.obtenerTodos();
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.puntoAccesoService.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePuntoAccesoDto) {
    return this.puntoAccesoService.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.puntoAccesoService.eliminar(id);
  }
}
