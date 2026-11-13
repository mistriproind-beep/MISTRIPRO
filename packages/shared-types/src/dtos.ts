import {
  UserRole,
  WorkerVerificationStatus,
  SupportedLanguage,
  ProjectType,
  PaymentBasis,
  ProjectStatus,
  RequirementStatus,
  ApplicationStatus,
  AssignmentStatus,
  SiteVisitStatus,
  PaymentStatus,
} from './enums';

export interface UserSummaryDto {
  id: string;
  phone: string;
  role: UserRole;
  fullName: string;
  profilePhotoUrl?: string;
  preferredLanguage: SupportedLanguage;
  isDevTestUser?: boolean;
}

export interface WorkerKycSubmitDto {
  fullName: string;
  alternatePhone?: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  primarySkillId: string;
  secondarySkillIds: string[];
  yearsOfExperience: number;
  workDescription?: string;
  preferredWorkingRadiusKm: number; // 5, 10, 25, 50
  isTeamLeader: boolean;
  maxTeamSize?: number;
  dailyWageExpectation?: number;
  govtIdType: 'AADHAAR' | 'PAN' | 'VOTER_ID' | 'DRIVING_LICENSE';
  govtIdNumber: string; // Stored securely/masked
  documentPhotoUrls: string[];
  portfolioPhotoUrls?: string[];
}

export interface WorkerProfileDto {
  id: string;
  userId: string;
  fullName: string;
  profilePhotoUrl?: string;
  verificationStatus: WorkerVerificationStatus;
  rejectionReason?: string;
  city: string;
  state: string;
  pincode: string;
  primarySkill: string;
  secondarySkills: string[];
  yearsOfExperience: number;
  rating: number;
  completedJobsCount: number;
  preferredWorkingRadiusKm: number;
  isTeamLeader: boolean;
  maxTeamSize: number;
  dailyWageExpectation?: number;
}

export interface CreateProjectRequirementItemDto {
  skillId: string;
  requiredCount: number;
  specialInstructions?: string;
}

export interface CreateProjectDto {
  title: string;
  description: string;
  projectType: ProjectType;
  photoUrls: string[];
  estimatedStartDate: string;
  expectedDuration?: string;
  location: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    landmark?: string;
  };
  requirements: CreateProjectRequirementItemDto[];
  budget: {
    totalEstimatedBudget: number;
    paymentBasis: PaymentBasis;
    expectedWagePerWorker?: number;
    foodAccommodationProvided: boolean;
    materialsProvided: boolean;
    additionalInstructions?: string;
  };
  contactDetails: {
    contactPersonName: string;
    primaryPhone: string;
    alternatePhone?: string;
    preferredContactMethod?: 'PHONE' | 'WHATSAPP' | 'IN_APP';
  };
}

export interface ProjectSummaryDto {
  id: string;
  projectCode: string; // e.g. MISTRI-26110001
  title: string;
  projectType: ProjectType;
  status: ProjectStatus;
  city: string;
  areaLandmark?: string;
  createdAt: string;
  totalRequirementsCount: number;
  totalVacanciesCount: number;
  totalSelectedCount: number;
  listingFeePaid: boolean;
}

export interface ProjectDetailDto extends ProjectSummaryDto {
  description: string;
  photoUrls: string[];
  estimatedStartDate: string;
  expectedDuration?: string;
  latitude?: number;
  longitude?: number;
  addressLine?: string; // Revealed only to assigned workers
  budget: {
    totalEstimatedBudget: number;
    paymentBasis: PaymentBasis;
    foodAccommodationProvided: boolean;
    materialsProvided: boolean;
  };
  requirements: {
    id: string;
    skillId: string;
    skillName: string;
    requiredCount: number;
    selectedCount: number;
    remainingVacancies: number;
    status: RequirementStatus;
  }[];
}

export interface WorkerApplicationSubmitDto {
  projectId: string;
  projectRequirementId: string;
  proposedWage?: number;
  message?: string;
}

export interface ProjectApplicationDto {
  id: string;
  projectId: string;
  projectRequirementId: string;
  workerId: string;
  workerName: string;
  workerPhotoUrl?: string;
  primarySkill: string;
  yearsOfExperience: number;
  rating: number;
  proposedWage?: number;
  message?: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface CreateSiteVisitDto {
  assignmentId: string;
  visitDate: string; // ISO format
  visitTime: string;
  purpose: string;
  notes?: string;
}

export interface SubmitWorkUpdateDto {
  assignmentId: string;
  status: AssignmentStatus;
  notes: string;
  photoUrls: string[];
}

export interface SubmitReviewDto {
  assignmentId: string;
  rating: number; // 1-5
  reviewText: string;
  punctualityScore?: number;
  workQualityScore?: number;
  behaviourScore?: number;
  photoUrls?: string[];
}
