import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { ResponseEmpresaDto } from './dto/response-empresa.dto';
import { plainToInstance } from 'class-transformer';

@Controller('empresas')
@UseInterceptors(ClassSerializerInterceptor)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  async create(@Body() dto: CreateEmpresaDto) {
    const empresa = await this.empresasService.create(dto);
    return plainToInstance(ResponseEmpresaDto, empresa, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll() {
    const empresas = await this.empresasService.findAll();
    return plainToInstance(ResponseEmpresaDto, empresas, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const empresa = await this.empresasService.findOne(+id);
    return plainToInstance(ResponseEmpresaDto, empresa, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEmpresaDto) {
    const empresa = await this.empresasService.update(+id, dto);
    return plainToInstance(ResponseEmpresaDto, empresa, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    await this.empresasService.softDelete(+id);
    return { message: 'Empresa eliminada lógicamente' };
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    const empresa = await this.empresasService.restore(+id);
    return plainToInstance(ResponseEmpresaDto, empresa, {
      excludeExtraneousValues: true,
    });
  }
}
