import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './presentation/interceptors/response.interceptor';
import { HttpExceptionFilter } from './presentation/filters/http-exception.filter';
import { SanitizeInterceptor } from './presentation/interceptors/sanitize.interceptor';
import { UsersService } from './infrastructure/services/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigModule } from '@nestjs/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const usersService = app.get(UsersService);
  const email = 'admin@authGate.com';
  const salt = 10;

  const existingAdmin = await usersService.findByEmail(email);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('P@ssw0rd123', salt);
    const adminUser = {
      name: 'Admin',
      email: email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role: 'admin',
    };
    await usersService.createAdmin(adminUser);
  }

  app.enableCors();
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalInterceptors(new SanitizeInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
