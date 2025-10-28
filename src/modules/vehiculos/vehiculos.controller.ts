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

  // 🔹 Crear un vehículo
  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo vehículo' })
  @ApiResponse({ status: 201, type: ResponseVehiculoDto })
  async crear(@Body() dto: CreateVehiculoDto): Promise<ResponseVehiculoDto> {
    const vehiculo = await this.vehiculosService.crear(dto);
    return plainToInstance(ResponseVehiculoDto, vehiculo);
  }

  // 🔹 Listar todos los vehículos
  @Get()
  @ApiOperation({ summary: 'Listar todos los vehículos' })
  @ApiResponse({ status: 200, type: [ResponseVehiculoDto] })
  async obtenerTodos(): Promise<ResponseVehiculoDto[]> {
    const vehiculos = await this.vehiculosService.obtenerTodos();
    return plainToInstance(ResponseVehiculoDto, vehiculos);
  }

  // 🔹 Obtener un vehículo por ID
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un vehículo por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseVehiculoDto })
  async obtenerUno(@Param('id', ParseIntPipe) id: number): Promise<ResponseVehiculoDto> {
    const vehiculo = await this.vehiculosService.obtenerUno(id);
    return plainToInstance(ResponseVehiculoDto, vehiculo);
  }

  // 🔹 Listar vehículos por contratista
  @Get('por-contratista/:contratistaId')
  @ApiOperation({ summary: 'Listar vehículos asociados a un contratista' })
  @ApiParam({ name: 'contratistaId', type: Number })
  @ApiResponse({ status: 200, type: [ResponseVehiculoDto] })
  async obtenerPorContratista(
    @Param('contratistaId', ParseIntPipe) contratistaId: number,
  ): Promise<ResponseVehiculoDto[]> {
    const vehiculos = await this.vehiculosService.obtenerPorContratista(contratistaId);
    return plainToInstance(ResponseVehiculoDto, vehiculos);
  }

  // 🔹 Actualizar un vehículo
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un vehículo' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ResponseVehiculoDto })
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVehiculoDto,
  ): Promise<ResponseVehiculoDto> {
    const vehiculo = await this.vehiculosService.actualizar(id, dto);
    return plainToInstance(ResponseVehiculoDto, vehiculo);
  }

  // 🔹 Eliminar un vehículo
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un vehículo' })
  async eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.vehiculosService.eliminar(id);
  }
}
