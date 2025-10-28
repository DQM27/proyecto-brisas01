import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { ResponseEmpresaDto } from './dto/response-empresa.dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('empresas')
@Controller('empresas')
@UseInterceptors(ClassSerializerInterceptor)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  // 📌 Solo ADMIN podrá crear empresas
  @Post()
  @ApiOperation({ summary: 'Crear una empresa (ADMIN)' })
  @ApiResponse({ status: 201, type: ResponseEmpresaDto })
  async create(@Body() dto: CreateEmpresaDto) {
    const empresa = await this.empresasService.create(dto);
    return plainToInstance(ResponseEmpresaDto, empresa, { excludeExtraneousValues: true });
  }

  // 📌 Listar con opción de incluir eliminadas (solo ADMIN en futuro)
  @Get()
  @ApiOperation({ summary: 'Listar empresas' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: [ResponseEmpresaDto] })
  async findAll(@Query('includeDeleted') includeDeleted?: string) {
    const empresas =
      includeDeleted === 'true'
        ? await this.empresasService.findAllIncludingDeleted()
        : await this.empresasService.findAll();

    return plainToInstance(ResponseEmpresaDto, empresas, { excludeExtraneousValues: true });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener empresa por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseEmpresaDto })
  async findOne(@Param('id') id: string) {
    const empresa = await this.empresasService.findOne(+id);
    return plainToInstance(ResponseEmpresaDto, empresa, { excludeExtraneousValues: true });
  }

  // 📌 Solo ADMIN podrá actualizar empresa
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar empresa (ADMIN)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseEmpresaDto })
  async update(@Param('id') id: string, @Body() dto: UpdateEmpresaDto) {
    const empresa = await this.empresasService.update(+id, dto);
    return plainToInstance(ResponseEmpresaDto, empresa, { excludeExtraneousValues: true });
  }

  // 📌 Solo ADMIN podrá eliminar lógicamente
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar empresa (ADMIN)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Empresa eliminada lógicamente' })
  async softDelete(@Param('id') id: string) {
    await this.empresasService.softDelete(+id);
    return { message: 'Empresa eliminada correctamente' };
  }

  // 📌 Solo ADMIN podrá restaurar
  @Post(':id/restore')
  @ApiOperation({ summary: 'Restaurar una empresa (ADMIN)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseEmpresaDto })
  async restore(@Param('id') id: string) {
    const empresa = await this.empresasService.restore(+id);
    return plainToInstance(ResponseEmpresaDto, empresa, { excludeExtraneousValues: true });
  }
}
