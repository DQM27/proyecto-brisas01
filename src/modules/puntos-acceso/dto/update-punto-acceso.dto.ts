import { PartialType } from '@nestjs/swagger';
import { CreatePuntoAccesoDto } from './create-punto-acceso.dto';

export class UpdatePuntoAccesoDto extends PartialType(CreatePuntoAccesoDto) {}
