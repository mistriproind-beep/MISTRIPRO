import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkerKycSubmitDto, WorkerVerificationStatus } from '@mistripro/shared-types';

@Injectable()
export class KycService {
  // In-memory worker KYC store for dev/mock runtime without DB
  private kycApplications = new Map<string, any>();

  constructor(private prisma: PrismaService) {}

  async submitKyc(userId: string, kycDto: WorkerKycSubmitDto) {
    if (!kycDto.fullName || !kycDto.primarySkillId || !kycDto.addressLine) {
      throw new BadRequestException('Mandatory KYC fields are missing');
    }

    const applicationId = `WP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const kycRecord = {
      applicationId,
      userId,
      fullName: kycDto.fullName,
      alternatePhone: kycDto.alternatePhone,
      addressLine: kycDto.addressLine,
      city: kycDto.city,
      state: kycDto.state,
      pincode: kycDto.pincode,
      primarySkillId: kycDto.primarySkillId,
      secondarySkillIds: kycDto.secondarySkillIds || [],
      yearsOfExperience: kycDto.yearsOfExperience || 0,
      workDescription: kycDto.workDescription,
      preferredWorkingRadiusKm: kycDto.preferredWorkingRadiusKm || 25,
      isTeamLeader: Boolean(kycDto.isTeamLeader),
      maxTeamSize: kycDto.maxTeamSize || 1,
      dailyWageExpectation: kycDto.dailyWageExpectation,
      // Private KYC security: Mask ID number and keep document in vault
      govtIdType: kycDto.govtIdType,
      govtIdNumberMasked: kycDto.govtIdNumber
        ? `XXXX-XXXX-${kycDto.govtIdNumber.slice(-4)}`
        : 'XXXX-XXXX-0000',
      documentPhotoUrls: kycDto.documentPhotoUrls || [],
      portfolioPhotoUrls: kycDto.portfolioPhotoUrls || [],
      status: WorkerVerificationStatus.UNDER_REVIEW,
      submittedAt: new Date().toISOString(),
      expectedReviewHours: '24–48 hours',
    };

    this.kycApplications.set(userId, kycRecord);

    return {
      message: 'Your registration application has been submitted successfully.',
      applicationId: kycRecord.applicationId,
      status: kycRecord.status,
      expectedReview: kycRecord.expectedReviewHours,
    };
  }

  async getKycStatus(userId: string) {
    const kyc = this.kycApplications.get(userId);
    if (!kyc) {
      return {
        status: WorkerVerificationStatus.UNVERIFIED,
        message: 'No KYC submission found',
      };
    }
    return {
      applicationId: kyc.applicationId,
      status: kyc.status,
      rejectionReason: kyc.rejectionReason,
      submittedAt: kyc.submittedAt,
    };
  }

  // Admin Actions
  async listPendingApplications() {
    return Array.from(this.kycApplications.values());
  }

  async updateApplicationStatus(
    userId: string,
    status: WorkerVerificationStatus,
    reason?: string,
  ) {
    const kyc = this.kycApplications.get(userId);
    if (!kyc) {
      throw new NotFoundException('KYC application not found');
    }

    kyc.status = status;
    if (reason) {
      kyc.rejectionReason = reason;
    }
    kyc.reviewedAt = new Date().toISOString();
    this.kycApplications.set(userId, kyc);

    return {
      message: `Worker verification status updated to ${status}`,
      applicationId: kyc.applicationId,
      status,
    };
  }
}
