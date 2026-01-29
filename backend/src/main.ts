import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuración para Cloudflare Workers
  const isCloudflareWorkers = typeof globalThis.addEventListener !== 'undefined';
  
  if (!isCloudflareWorkers) {
    // Configuración CORS solo para desarrollo local
    app.enableCors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  }
  
  // Prefijo global de API
  app.setGlobalPrefix(`api/${process.env.API_VERSION || 'v1'}`);
  
  // Pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Filtros globales
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Interceptors globales
  app.useGlobalInterceptors(new ResponseInterceptor());
  
  // En producción Workers, el puerto es manejado por Cloudflare
  if (!isCloudflareWorkers) {
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 RRHHMod Backend running on port ${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/${process.env.API_VERSION || 'v1'}`);
  }
  
  return app;
}

// Para Cloudflare Workers
export const handler = async (request: Request, env: any, ctx: any) => {
  const app = await bootstrap();
  
  // Inyectar variables de entorno de Cloudflare Workers
  if (env) {
    process.env.DATABASE_URL = `file:./${env.DB.database_name}.db`;
    process.env.JWT_SECRET = env.JWT_SECRET || process.env.JWT_SECRET;
    process.env.ENVIRONMENT = env.ENVIRONMENT || 'production';
  }
  
  // Manejar la petición con NestJS
  // Esto requiere configuración adicional para Workers
  // Ver: https://github.com/cloudflare/workers-for-platforms-example
  return app.handle(request);
};