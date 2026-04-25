import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, Matches, IsUUID } from 'class-validator';

export class UserDto {
  @ApiProperty({ description: 'ID người dùng', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: 'Tên người dùng', example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'Email đăng nhập', example: 'admin@demo.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Mật khẩu (ít nhất 8 ký tự, gồm 1 chữ hoa, 1 chữ thường, 1 số)', example: 'Demo@123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least 1 uppercase, 1 lowercase, and 1 number',
  })
  password!: string;
}
