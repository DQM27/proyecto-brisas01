import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 📦 Importa todos los módulos
import { EmpresasModule } from './modules/empresas/empresas.module';
import { ContratistasModule } from './modules/contratistas/contratistas.module';
import { VehiculosModule } from './modules/vehiculos/vehiculos.module';
import { GafetesModule } from './modules/gafetes/gafetes.module';
import { ListaNegraModule } from './modules/lista-negra/lista-negra.module';
import { PuntoAccesoModule } from './modules/puntos-acceso/punto-acceso.module';
import { IngresosModule } from './modules/ingresos/ingresos.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';

@Module({
  imports: [
    // 🌍 Configuración global de entorno (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 🗄️ Configuración de TypeORM con variables de entorno
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<'postgres' | 'sqlite'>('DB_TYPE', 'sqlite'),
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASS', ''),
        database: config.get<string>('DB_NAME', 'nestjs_app'),
        autoLoadEntities: true,
        synchronize: true, // ⚠️ Solo usar en desarrollo, elimina y recrea las tablas
        entities: [__dirname + '/modules/**/*.entity{.ts,.js}'], // 🔥 Fuerza carga de entidades
        logging: true, // 👀 opcional: para ver las queries generadas
      }),
    }),

    // 📦 Módulos del dominio
    EmpresasModule,
    ContratistasModule,
    VehiculosModule,
    GafetesModule,
    ListaNegraModule,
    PuntoAccesoModule,
    IngresosModule,
    UsuariosModule,
  ],
})
export class AppModule {}
