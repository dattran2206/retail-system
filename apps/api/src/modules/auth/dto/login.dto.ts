import { PickType } from '@nestjs/swagger';
import { UserDto } from '../../user/dto/user.dto';

export class LoginDto extends PickType(UserDto, ['email', 'password'] as const) {}
