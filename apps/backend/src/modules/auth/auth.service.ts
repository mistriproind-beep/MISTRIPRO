import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, SwitchRoleDto } from './dto/login.dto';
import { MISTRI_PRO_CONSTANTS, UserRole, SupportedLanguage } from '@mistripro/shared-types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { usernameOrPhone, passwordOrOtp } = loginDto;

    // 1. Development Test Account Check: abc / 1234
    if (
      usernameOrPhone.trim().toLowerCase() === MISTRI_PRO_CONSTANTS.DEV_TEST_ACCOUNT.username &&
      passwordOrOtp === MISTRI_PRO_CONSTANTS.DEV_TEST_ACCOUNT.password
    ) {
      const devUser = {
        id: 'dev-test-user-001',
        username: 'abc',
        phone: '+919999999999',
        role: UserRole.CUSTOMER,
        fullName: 'Demo Test User',
        preferredLanguage: SupportedLanguage.EN,
        isDevTestAccount: true,
      };

      const token = this.jwtService.sign({
        sub: devUser.id,
        role: devUser.role,
        username: devUser.username,
        phone: devUser.phone,
        isDevTestAccount: true,
      });

      return {
        message: 'Dev test login successful',
        token,
        user: devUser,
      };
    }

    // 2. Production / Mock Phone Login
    if (!usernameOrPhone) {
      throw new BadRequestException('Phone number or username is required');
    }

    const normalizedPhone = usernameOrPhone.trim();
    const user = {
      id: `usr_${Date.now()}`,
      phone: normalizedPhone,
      role: UserRole.CUSTOMER,
      fullName: 'Mistri User',
      preferredLanguage: SupportedLanguage.HI,
      isDevTestAccount: false,
    };

    const token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
      phone: user.phone,
      isDevTestAccount: false,
    });

    return {
      message: 'Login successful',
      token,
      user,
    };
  }

  async switchRole(userId: string, switchDto: SwitchRoleDto) {
    const { targetRole } = switchDto;
    if (![UserRole.CUSTOMER, UserRole.WORKER].includes(targetRole as UserRole)) {
      throw new BadRequestException('Invalid target role');
    }

    // Generate new token with updated role
    const token = this.jwtService.sign({
      sub: userId,
      role: targetRole,
    });

    return {
      message: `Role switched successfully to ${targetRole}`,
      activeRole: targetRole,
      token,
    };
  }

  async updateLanguage(userId: string, language: SupportedLanguage) {
    return {
      message: `Preferred language updated to ${language}`,
      preferredLanguage: language,
    };
  }
}
