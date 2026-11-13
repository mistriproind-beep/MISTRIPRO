import { Body, Controller, Get, Post, Put, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { WorkerKycSubmitDto, WorkerVerificationStatus } from '@mistripro/shared-types';

@ApiTags('Worker KYC & Verification')
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('submit')
  @ApiOperation({ summary: 'Submit worker KYC verification application' })
  async submitKyc(@CurrentUser() user: any, @Body() kycDto: WorkerKycSubmitDto) {
    return this.kycService.submitKyc(user.userId, kycDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('status')
  @ApiOperation({ summary: 'Check worker verification status' })
  async getStatus(@CurrentUser() user: any) {
    return this.kycService.getKycStatus(user.userId);
  }

  // Admin endpoints
  @Get('admin/applications')
  @ApiOperation({ summary: 'Admin: List worker verification applications' })
  async listApplications() {
    return this.kycService.listPendingApplications();
  }

  @Put('admin/applications/:userId/status')
  @ApiOperation({ summary: 'Admin: Approve, Reject, or Request correction' })
  async updateStatus(
    @Param('userId') userId: string,
    @Body('status') status: WorkerVerificationStatus,
    @Body('reason') reason?: string,
  ) {
    return this.kycService.updateApplicationStatus(userId, status, reason);
  }
}
