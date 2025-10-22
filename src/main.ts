import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function main() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // ✅ Prefijo global para tus rutas
  app.setGlobalPrefix('api');

  // ✅ Validación global (usa class-validator / class-transformer)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en DTO
      forbidNonWhitelisted: false,
      transform: true, // transforma automáticamente a los tipos de los DTO
    }),
  );

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}/api`);
}

// 👇 Ejecutamos directamente sin bootstrap()
main().catch((err) => {
  console.error('❌ Error al iniciar la aplicación:', err);
  process.exit(1);
});
