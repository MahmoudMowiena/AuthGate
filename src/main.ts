import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './presentation/interceptors/response.interceptor';
import { HttpExceptionFilter } from './presentation/filters/http-exception.filter';
import { SanitizeInterceptor } from './presentation/interceptors/sanitize.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalInterceptors(new SanitizeInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
