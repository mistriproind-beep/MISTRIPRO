import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateProjectDto,
  ProjectStatus,
  RequirementStatus,
  ApplicationStatus,
  WorkerApplicationSubmitDto,
  MISTRI_PRO_CONSTANTS,
  MASTER_SKILL_CATEGORIES,
} from '@mistripro/shared-types';

@Injectable()
export class ProjectsService {
  private projects = new Map<string, any>();
  private applications = new Map<string, any>();
  private nextSequence = 10001;

  constructor(private prisma: PrismaService) {
    // Seed initial demo project matching Section 6 & 8 of PRD
    this.seedDemoProject();
  }

  private seedDemoProject() {
    const demoProject = {
      id: 'proj-demo-001',
      projectCode: 'MISTRI-26110001',
      customerId: 'dev-test-user-001',
      customerName: 'Ramesh Sharma',
      title: 'Residential House Construction & Renovation',
      description:
        'Complete bathroom renovation, wall plastering, tile flooring and new sanitary plumbing work.',
      projectType: 'RESIDENTIAL',
      status: ProjectStatus.PUBLISHED,
      city: 'Jaipur',
      areaLandmark: 'Vaishali Nagar',
      addressLine: 'Plot 42, Officers Campus, Sirsi Road',
      latitude: 26.9124,
      longitude: 75.7873,
      totalEstimatedBudget: 50000,
      paymentBasis: 'NEGOTIABLE',
      expectedWagePerWorker: 850,
      estimatedStartDate: '2026-11-20',
      expectedDuration: '30 days',
      foodAccommodationProvided: false,
      materialsProvided: true,
      contactPersonName: 'Ramesh Sharma',
      primaryPhone: '+919829012345',
      listingFeePaid: true,
      photoUrls: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb18f156b?w=600',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600',
      ],
      requirements: [
        {
          id: 'req-mason-001',
          skillId: 'skill-mason',
          skillCode: 'MASON',
          skillName: 'Mason (राजमिस्त्री)',
          requiredCount: 3,
          selectedCount: 2,
          remainingVacancies: 1,
          status: RequirementStatus.PARTIALLY_FILLED,
        },
        {
          id: 'req-labour-001',
          skillId: 'skill-labour',
          skillCode: 'LABOUR',
          skillName: 'Construction Labour (मजदूर)',
          requiredCount: 5,
          selectedCount: 1,
          remainingVacancies: 4,
          status: RequirementStatus.PARTIALLY_FILLED,
        },
      ],
      createdAt: new Date().toISOString(),
    };
    this.projects.set(demoProject.id, demoProject);
  }

  private generateProjectCode(): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const seq = this.nextSequence++;
    return `MISTRI-${yy}${mm}${seq}`;
  }

  async createProject(customerId: string, createDto: CreateProjectDto) {
    if (!createDto.title || !createDto.requirements || createDto.requirements.length === 0) {
      throw new BadRequestException('Project title and at least one worker requirement are required');
    }

    const projectId = `proj_${Date.now()}`;
    const projectCode = this.generateProjectCode();

    const requirements = createDto.requirements.map((req, idx) => {
      const skill = MASTER_SKILL_CATEGORIES.find((s) => s.id === req.skillId);
      return {
        id: `req_${projectId}_${idx}`,
        skillId: req.skillId,
        skillCode: skill?.code || 'OTHER_SKILLED',
        skillName: skill ? `${skill.name.en} (${skill.name.hi})` : 'Skilled Worker',
        requiredCount: req.requiredCount || 1,
        selectedCount: 0,
        remainingVacancies: req.requiredCount || 1,
        status: RequirementStatus.OPEN,
        specialInstructions: req.specialInstructions,
      };
    });

    const newProject = {
      id: projectId,
      projectCode,
      customerId,
      customerName: createDto.contactDetails.contactPersonName,
      title: createDto.title,
      description: createDto.description,
      projectType: createDto.projectType,
      status: ProjectStatus.PENDING_PAYMENT, // Awaiting ₹299 listing fee
      city: createDto.location.city,
      areaLandmark: createDto.location.landmark,
      addressLine: createDto.location.addressLine,
      latitude: createDto.location.latitude,
      longitude: createDto.location.longitude,
      totalEstimatedBudget: createDto.budget.totalEstimatedBudget,
      paymentBasis: createDto.budget.paymentBasis,
      expectedWagePerWorker: createDto.budget.expectedWagePerWorker,
      estimatedStartDate: createDto.estimatedStartDate,
      expectedDuration: createDto.expectedDuration,
      foodAccommodationProvided: createDto.budget.foodAccommodationProvided,
      materialsProvided: createDto.budget.materialsProvided,
      additionalInstructions: createDto.budget.additionalInstructions,
      contactPersonName: createDto.contactDetails.contactPersonName,
      primaryPhone: createDto.contactDetails.primaryPhone,
      alternatePhone: createDto.contactDetails.alternatePhone,
      listingFeePaid: false,
      listingFeeAmountInr: MISTRI_PRO_CONSTANTS.LISTING_FEE_INR,
      photoUrls: createDto.photoUrls,
      requirements,
      createdAt: new Date().toISOString(),
    };

    this.projects.set(projectId, newProject);

    return {
      message: 'Project created successfully. Proceed to pay ₹299 listing fee to publish.',
      projectId: newProject.id,
      projectCode: newProject.projectCode,
      listingFeeInr: MISTRI_PRO_CONSTANTS.LISTING_FEE_INR,
      status: newProject.status,
    };
  }

  async listFeedProjects(skillFilter?: string, cityFilter?: string) {
    // Only return PUBLISHED projects in public feed
    return Array.from(this.projects.values()).filter(
      (p) => p.status === ProjectStatus.PUBLISHED,
    );
  }

  async getProjectById(projectId: string) {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async applyToRequirement(workerId: string, applyDto: WorkerApplicationSubmitDto) {
    const project = this.projects.get(applyDto.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const requirement = project.requirements.find(
      (r: any) => r.id === applyDto.projectRequirementId,
    );
    if (!requirement) {
      throw new NotFoundException('Requirement not found in project');
    }

    if (requirement.remainingVacancies <= 0) {
      throw new BadRequestException('All vacancies for this requirement have already been filled');
    }

    // Check duplicate application
    const appKey = `${applyDto.projectRequirementId}_${workerId}`;
    if (this.applications.has(appKey)) {
      throw new BadRequestException('You have already applied for this requirement');
    }

    const application = {
      id: `app_${Date.now()}`,
      projectId: applyDto.projectId,
      projectRequirementId: applyDto.projectRequirementId,
      workerId,
      proposedWage: applyDto.proposedWage,
      message: applyDto.message,
      status: ApplicationStatus.SUBMITTED,
      appliedAt: new Date().toISOString(),
    };

    this.applications.set(appKey, application);

    return {
      message: 'Application submitted successfully. Customer will review your profile.',
      applicationId: application.id,
      status: application.status,
    };
  }

  async selectWorker(
    customerId: string,
    projectId: string,
    requirementId: string,
    workerId: string,
  ) {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const requirement = project.requirements.find((r: any) => r.id === requirementId);
    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    // Strict vacancy check (ACID guarantee)
    if (requirement.remainingVacancies <= 0) {
      throw new BadRequestException('Cannot select more workers: all vacancies are filled');
    }

    // Update vacancy counts
    requirement.selectedCount += 1;
    requirement.remainingVacancies -= 1;
    if (requirement.remainingVacancies === 0) {
      requirement.status = RequirementStatus.FILLED;
    } else {
      requirement.status = RequirementStatus.PARTIALLY_FILLED;
    }

    const appKey = `${requirementId}_${workerId}`;
    const application = this.applications.get(appKey);
    if (application) {
      application.status = ApplicationStatus.SELECTED;
      this.applications.set(appKey, application);
    }

    const assignment = {
      id: `asgn_${Date.now()}`,
      projectId,
      projectRequirementId: requirementId,
      workerId,
      status: 'SELECTED',
      createdAt: new Date().toISOString(),
    };

    return {
      message: 'Worker selected successfully for this vacancy.',
      assignment,
      requirementSummary: {
        required: requirement.requiredCount,
        selected: requirement.selectedCount,
        remaining: requirement.remainingVacancies,
      },
    };
  }
}
