import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'abc', description: 'Username or mobile number' })
  @IsNotEmpty()
  @IsString()
  usernameOrPhone: string;

  @ApiPropertyOptional({ example: '1234', description: 'Password or OTP' })
  @IsOptional()
  @IsString()
  passwordOrOtp?: string;
}

export class SwitchRoleDto {
  @ApiProperty({ example: 'WORKER', enum: ['CUSTOMER', 'WORKER'] })
  @IsNotEmpty()
  @IsString()
  targetRole: 'CUSTOMER' | 'WORKER';
}
