import { OmitType } from '@nestjs/swagger';
import { TenantDto } from './tenant.dto';

export class CreateTenantDto extends OmitType(TenantDto, ['id'] as const) {}
