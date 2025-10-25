import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { HistorialGafete } from '../gafetes/entities/historial-gafete.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EstadoDevolucionGafete } from '@common/enums/estado-devolucion-gafete.enum';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @InjectRepository(HistorialGafete)
    private readonly historialRepo: Repository<HistorialGafete>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR) // cada hora
  async revisarGafetesPendientes() {
    const pendientes = await this.historialRepo.find({
      where: [
        { fechaDevolucion: undefined },
        { estadoDevolucion: EstadoDevolucionGafete.DAÑADO },
        { estadoDevolucion: EstadoDevolucionGafete.PERDIDO },
      ],
      relations: ['contratista', 'gafete'],
    });

    pendientes.forEach((h) => {
      this.logger.warn(
        `Notificación: Contratista ${h.contratista?.id} debe el gafete ${h.gafete.codigo}`,
      );
      // Aquí podrías enviar email, push, slack, etc.
    });
  }
}
