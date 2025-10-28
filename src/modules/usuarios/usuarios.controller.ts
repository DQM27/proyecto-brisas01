import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { Request } from 'express';
// import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';  ⬅️ se activará después
// import { RolesGuard } from '@common/guards/roles.guard';
// import { Roles } from '@common/decorators/roles.decorator';
// import { RolUsuario } from '@common/enums/rol-usuario.enum';

@ApiTags('usuarios')
@Controller('usuarios')
@UseInterceptors(ClassSerializerInterceptor)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, type: ResponseUsuarioDto })
  // 🔒 SOLO ADMIN en el futuro
  async create(@Body() dto: CreateUsuarioDto) {
    const usuario = await this.usuariosService.create(dto);
    return plainToInstance(ResponseUsuarioDto, usuario, { excludeExtraneousValues: true });
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios activos' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200 })
  // 🔒 ADMIN o SUPERVISOR
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.usuariosService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID (sin eliminados)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseUsuarioDto })
  // 🔒 ADMIN o SUPERVISOR
  async findOne(@Param('id') id: string) {
    const usuario = await this.usuariosService.findOne(+id);
    return plainToInstance(ResponseUsuarioDto, usuario, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de usuario' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseUsuarioDto })
  // 🔒 ADMIN (o el mismo usuario cambiando datos básicos)
  async update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    const usuario = await this.usuariosService.update(+id, dto);
    return plainToInstance(ResponseUsuarioDto, usuario, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario (soft delete)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200 })
  // 🔒 SOLO ADMIN
  async softDelete(@Param('id') id: string) {
    await this.usuariosService.softDelete(+id);
    return { message: 'Usuario eliminado correctamente' };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restaurar usuario eliminado' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200 })
  // 🔒 SOLO ADMIN
  async restore(@Param('id') id: string) {
    const usuario = await this.usuariosService.restore(+id);
    return plainToInstance(ResponseUsuarioDto, usuario, { excludeExtraneousValues: true });
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Resetear contraseña sin necesidad de la actual (solo admin)' })
  @ApiParam({ name: 'id', type: Number })
  // 🔒 SOLO ADMIN
  async resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    const usuario = await this.usuariosService.resetPassword(+id, dto.nuevaPassword);
    return plainToInstance(ResponseUsuarioDto, usuario, { excludeExtraneousValues: true });
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Cambio de contraseña del usuario autenticado' })
  // 🔒 Debe estar logueado (JwtAuthGuard)
  async changePassword(@Req() req: Request & { user: JwtPayload }, @Body() dto: ChangePasswordDto) {
    const userId = req.user.sub;
    await this.usuariosService.changePassword(userId, dto.passwordActual, dto.nuevaPassword);
    return { message: 'Contraseña actualizada correctamente' };
  }
}
