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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('empresas')
@Controller('empresas')
@UseInterceptors(ClassSerializerInterceptor)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva empresa' })
  @ApiResponse({ status: 201, type: ResponseEmpresaDto })
  async create(@Body() dto: CreateEmpresaDto) {
    const empresa = await this.empresasService.create(dto);
    return plainToInstance(ResponseEmpresaDto, empresa); // <- aquí quitamos excludeExtraneousValues
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las empresas' })
  @ApiResponse({ status: 200, type: [ResponseEmpresaDto] })
  async findAll() {
    const empresas = await this.empresasService.findAll();
    return plainToInstance(ResponseEmpresaDto, empresas); // <- aquí también
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener empresa por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseEmpresaDto })
  async findOne(@Param('id') id: string) {
    const empresa = await this.empresasService.findOne(+id);
    return plainToInstance(ResponseEmpresaDto, empresa); // <- y aquí
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar empresa por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseEmpresaDto })
  async update(@Param('id') id: string, @Body() dto: UpdateEmpresaDto) {
    const empresa = await this.empresasService.update(+id, dto);
    return plainToInstance(ResponseEmpresaDto, empresa); // <- aquí
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar lógicamente una empresa' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Empresa eliminada lógicamente' })
  async softDelete(@Param('id') id: string) {
    await this.empresasService.softDelete(+id);
    return { message: 'Empresa eliminada lógicamente' };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restaurar empresa eliminada lógicamente' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseEmpresaDto })
  async restore(@Param('id') id: string) {
    const empresa = await this.empresasService.restore(+id);
    return plainToInstance(ResponseEmpresaDto, empresa); // <- y aquí
  }
}
