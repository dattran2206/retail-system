import { PickType } from '@nestjs/swagger';
import { UserDto } from '../../user/dto/user.dto';

export class RegisterDto extends PickType(UserDto, ['name', 'email', 'password'] as const) {}
