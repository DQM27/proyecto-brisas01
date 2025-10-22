import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { GafetesService } from './gafetes.service';
import { CreateGafeteDto } from './dto/create-gafete.dto';
import { UpdateGafeteDto } from './dto/update-gafete.dto';

@Controller('gafetes')
export class GafetesController {
  constructor(private readonly gafetesService: GafetesService) {}

  @Post()
  create(@Body() dto: CreateGafeteDto) {
    return this.gafetesService.create(dto);
  }

  @Get()
  findAll() {
    return this.gafetesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gafetesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGafeteDto) {
    return this.gafetesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gafetesService.softDelete(id);
  }

  // 🩵 Nuevo endpoint opcional para restaurar un gafete eliminado lógicamente
  @Patch('restore/:id')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.gafetesService.restore(id);
  }
}
