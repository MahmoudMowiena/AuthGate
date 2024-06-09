import { tenantModel } from '../../presentation/dtos/tenant.model';
import { Tenant } from '../../domain/entities/tenant.entity';

export interface ITenantRepository {
    create(createTenantDto: tenantModel): Promise<Tenant>;

    findAll(): Promise<Tenant[]>;

    findOne(id: string): Promise<Tenant>;
}
