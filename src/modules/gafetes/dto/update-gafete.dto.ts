import { PartialType } from '@nestjs/mapped-types';
import { CreateGafeteDto } from './create-gafete.dto';
import { IsOptional, IsInt } from 'class-validator';

export class UpdateGafeteDto extends PartialType(CreateGafeteDto) {
  @IsOptional()
  @IsInt()
  contratistaId?: number; // mantenerlo también
}
