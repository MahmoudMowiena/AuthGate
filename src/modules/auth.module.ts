import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { AuthController } from 'src/presentation/controllers/auth.controller';
import { UserModule } from './user.module';
import { TenantModule } from './tenant.module';
import { ProjectsModule } from './project.module';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import { tenantModel } from 'src/presentation/dtos/tenant.model';

@Module({
  imports: [
    UserModule,
    TenantModule,
    ProjectsModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
