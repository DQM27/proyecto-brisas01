import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { ResponseVehiculoDto } from './dto/response-vehiculo.dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('vehiculos')
@Controller('vehiculos')
@UseInterceptors(ClassSerializerInterceptor)
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo vehículo' })
  @ApiResponse({ status: 201, type: ResponseVehiculoDto })
  async crear(@Body() dto: CreateVehiculoDto) {
    const vehiculo = await this.vehiculosService.crear(dto);
    return plainToInstance(ResponseVehiculoDto, vehiculo);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los vehículos' })
  @ApiResponse({ status: 200, type: [ResponseVehiculoDto] })
  async obtenerTodos() {
    const vehiculos = await this.vehiculosService.obtenerTodos();
    return plainToInstance(ResponseVehiculoDto, vehiculos);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un vehículo por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseVehiculoDto })
  async obtenerUno(@Param('id', ParseIntPipe) id: number) {
    const vehiculo = await this.vehiculosService.obtenerUno(id);
    return plainToInstance(ResponseVehiculoDto, vehiculo);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un vehículo' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseVehiculoDto })
  async actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVehiculoDto) {
    const vehiculo = await this.vehiculosService.actualizar(id, dto);
    return plainToInstance(ResponseVehiculoDto, vehiculo);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un vehículo' })
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.vehiculosService.eliminar(id);
  }
}
