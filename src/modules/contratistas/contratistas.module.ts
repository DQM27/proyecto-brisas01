import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contratista } from './entities/contratista.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { ContratistasService } from './contratistas.service';
import { ContratistasController } from './contratistas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contratista, Empresa])],
  controllers: [ContratistasController],
  providers: [ContratistasService],
  exports: [ContratistasService],
})
export class ContratistasModule {}
