import { PartialType } from '@nestjs/swagger';
import { CreateGafeteDto } from './create-gafete.dto';

export class UpdateGafeteDto extends PartialType(CreateGafeteDto) {}
