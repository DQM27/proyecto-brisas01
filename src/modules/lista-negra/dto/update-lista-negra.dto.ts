import { PartialType } from '@nestjs/mapped-types';
import { CreateListaNegraDto } from './create-lista-negra.dto';

export class UpdateListaNegraDto extends PartialType(CreateListaNegraDto) {}
