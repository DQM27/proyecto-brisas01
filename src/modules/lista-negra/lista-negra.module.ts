import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListaNegra } from './entities/lista-negra.entity';
import { Contratista } from '../contratistas/entities/contratista.entity';
import { ListaNegraService } from './lista-negra.service';
import { ListaNegraController } from './lista-negra.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ListaNegra, Contratista])],
  controllers: [ListaNegraController],
  providers: [ListaNegraService],
})
export class ListaNegraModule {}
