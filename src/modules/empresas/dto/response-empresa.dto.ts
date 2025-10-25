// src/modules/empresas/dto/response-empresa.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ResponseEmpresaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ required: false })
  ruc?: string;

  @ApiProperty({ required: false })
  direccion?: string;

  @ApiProperty({ required: false })
  telefono?: string;

  @ApiProperty()
  fechaCreacion: Date;

  @ApiProperty()
  fechaActualizacion: Date;
}
