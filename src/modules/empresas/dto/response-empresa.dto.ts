// src/modules/empresas/dto/response-empresa.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ResponseEmpresaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
