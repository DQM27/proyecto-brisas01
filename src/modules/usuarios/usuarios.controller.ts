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
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { plainToInstance } from 'class-transformer';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';

@Controller('usuarios')
@UseInterceptors(ClassSerializerInterceptor)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  async create(@Body() dto: CreateUsuarioDto) {
    const usuario = await this.usuariosService.create(dto);
    return plainToInstance(ResponseUsuarioDto, usuario, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll() {
    const usuarios = await this.usuariosService.findAll();
    return plainToInstance(ResponseUsuarioDto, usuarios, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const usuario = await this.usuariosService.findOne(+id);
    return plainToInstance(ResponseUsuarioDto, usuario, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    const usuario = await this.usuariosService.update(+id, dto);
    return plainToInstance(ResponseUsuarioDto, usuario, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    await this.usuariosService.softDelete(+id);
    return { message: 'Usuario eliminado lógicamente' };
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    const usuario = await this.usuariosService.restore(+id);
    return plainToInstance(ResponseUsuarioDto, usuario, {
      excludeExtraneousValues: true,
    });
  }
}
