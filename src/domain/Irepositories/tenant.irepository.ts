import { tenantModel } from '../../presentation/dtos/tenant.model';
import { Tenant } from '../../domain/entities/tenant.entity';

export interface ITenantRepository {
  create(tenant: tenantModel): Promise<Tenant>;

  findByEmail(email: string): Promise<Tenant | null>;
  
  findAll(): Promise<Tenant[]>;
}
