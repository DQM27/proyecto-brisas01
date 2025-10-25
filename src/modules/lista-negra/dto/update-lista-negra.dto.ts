import { PartialType } from '@nestjs/swagger';
import { CreateListaNegraDto } from './create-lista-negra.dto';

export class UpdateListaNegraDto extends PartialType(CreateListaNegraDto) {}
