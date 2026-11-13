import { Body, Controller, Post, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, SwitchRoleDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SupportedLanguage } from '@mistripro/shared-types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login with phone/OTP or development test credentials (abc / 1234)',
  })
  @ApiResponse({ status: 200, description: 'Authentication successful with JWT' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('switch-role')
  @ApiOperation({
    summary: 'Switch active user role between CUSTOMER and WORKER',
  })
  async switchRole(@CurrentUser() user: any, @Body() switchRoleDto: SwitchRoleDto) {
    return this.authService.switchRole(user.userId, switchRoleDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('language')
  @ApiOperation({
    summary: 'Update user preferred language (en, hi, gu, mr)',
  })
  async updateLanguage(
    @CurrentUser() user: any,
    @Body('language') language: SupportedLanguage,
  ) {
    return this.authService.updateLanguage(user.userId, language);
  }
}
