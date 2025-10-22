import { PartialType } from '@nestjs/mapped-types';
import { CreatePuntoAccesoDto } from './create-punto-acceso.dto';

export class UpdatePuntoAccesoDto extends PartialType(CreatePuntoAccesoDto) {}
