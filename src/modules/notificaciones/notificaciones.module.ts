import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesService } from './notificaciones.service';
import { HistorialGafete } from '../gafetes/entities/historial-gafete.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialGafete])],
  providers: [NotificacionesService],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
