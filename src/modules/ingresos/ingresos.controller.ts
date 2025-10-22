import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { IngresosService } from './ingresos.service';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';

@Controller('ingresos')
export class IngresosController {
  constructor(private readonly ingresosService: IngresosService) {}

  @Post()
  registrarIngreso(@Body() dto: CreateIngresoDto, @Query('usuarioId') usuarioId: string) {
    return this.ingresosService.registrarIngreso(dto, +usuarioId);
  }

  @Post(':contratistaId/salida')
  registrarSalida(
    @Param('contratistaId') contratistaId: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    return this.ingresosService.registrarSalida(+contratistaId, +usuarioId);
  }

  @Get()
  findAll() {
    return this.ingresosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingresosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIngresoDto) {
    return this.ingresosService.update(+id, dto);
  }
}
