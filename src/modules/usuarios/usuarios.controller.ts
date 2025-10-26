import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query, // ⬅️ AGREGADO
  Req,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger'; // ⬅️ ApiQuery agregado
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { Request } from 'express';

@ApiTags('usuarios')
@Controller('usuarios')
@UseInterceptors(ClassSerializerInterceptor)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, type: ResponseUsuarioDto })
  async create(@Body() dto: CreateUsuarioDto) {
    const usuario = await this.usuariosService.create(dto);
    return plainToInstance(ResponseUsuarioDto, usuario, { excludeExtraneousValues: true });
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: String,
    description: 'Incluir usuarios eliminados (true/false)',
  })
  @ApiResponse({ status: 200, type: [ResponseUsuarioDto] })
  async findAll(@Query('includeDeleted') includeDeleted?: string) {
    const usuarios =
      includeDeleted === 'true'
        ? await this.usuariosService.findAllIncludingDeleted()
        : await this.usuariosService.findAll();
    return plainToInstance(ResponseUsuarioDto, usuarios, { excludeExtraneousValues: true });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseUsuarioDto })
  async findOne(@Param('id') id: string) {
    const usuario = await this.usuariosService.findOne(+id);
    return plainToInstance(ResponseUsuarioDto, usuario, { excludeExtraneousValues: true });
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Obtener usuario por email' })
  @ApiParam({ name: 'email', type: String })
  @ApiResponse({ status: 200, type: ResponseUsuarioDto })
  async findByEmail(@Param('email') email: string) {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) {
      return { message: 'Usuario no encontrado' };
    }
    return plainToInstance(ResponseUsuarioDto, usuario, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseUsuarioDto })
  async update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    const usuario = await this.usuariosService.update(+id, dto);
    return plainToInstance(ResponseUsuarioDto, usuario, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar lógicamente un usuario' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Usuario eliminado lógicamente' })
  async softDelete(@Param('id') id: string) {
    await this.usuariosService.softDelete(+id);
    return { message: 'Usuario eliminado lógicamente' };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restaurar usuario eliminado lógicamente' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseUsuarioDto })
  async restore(@Param('id') id: string) {
    const usuario = await this.usuariosService.restore(+id);
    return plainToInstance(ResponseUsuarioDto, usuario, { excludeExtraneousValues: true });
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Resetear contraseña de un usuario' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseUsuarioDto })
  async resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    const usuario = await this.usuariosService.resetPassword(+id, dto.nuevaPassword);
    return plainToInstance(ResponseUsuarioDto, usuario, { excludeExtraneousValues: true });
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cambiar la contraseña del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada exitosamente' })
  async changePassword(@Req() req: Request & { user: JwtPayload }, @Body() dto: ChangePasswordDto) {
    const userId = req.user.sub;
    await this.usuariosService.changePassword(userId, dto.passwordActual, dto.nuevaPassword);
    return { message: 'Contraseña cambiada exitosamente' };
  }
}
