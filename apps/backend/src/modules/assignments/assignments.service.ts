import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  AssignmentStatus,
  SiteVisitStatus,
  CreateSiteVisitDto,
  SubmitWorkUpdateDto,
  SubmitReviewDto,
} from '@mistripro/shared-types';

@Injectable()
export class AssignmentsService {
  private assignments = new Map<string, any>();
  private siteVisits = new Map<string, any>();
  private reviews = new Map<string, any>();

  constructor() {
    // Seed initial demo assignment
    this.assignments.set('asgn-demo-001', {
      id: 'asgn-demo-001',
      projectId: 'proj-demo-001',
      workerId: 'worker-rajesh-001',
      workerName: 'Rajesh Kumar',
      skillName: 'Mason (राजमिस्त्री)',
      status: AssignmentStatus.WORK_IN_PROGRESS,
      agreedWage: 900,
      createdAt: new Date().toISOString(),
      updates: [
        {
          id: 'upd-001',
          status: AssignmentStatus.WORK_STARTED,
          notes: 'Started dismantling old bathroom tiles and leveling floor.',
          photoUrls: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600'],
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }

  async getAssignment(assignmentId: string) {
    const asgn = this.assignments.get(assignmentId);
    if (!asgn) {
      throw new NotFoundException('Assignment record not found');
    }
    return asgn;
  }

  // Site Visits
  async scheduleSiteVisit(dto: CreateSiteVisitDto) {
    const visitId = `visit_${Date.now()}`;
    const visit = {
      id: visitId,
      assignmentId: dto.assignmentId,
      visitDate: dto.visitDate,
      visitTime: dto.visitTime,
      purpose: dto.purpose,
      notes: dto.notes,
      status: SiteVisitStatus.REQUESTED,
      createdAt: new Date().toISOString(),
    };
    this.siteVisits.set(visitId, visit);
    return {
      message: 'Site visit scheduled. Awaiting confirmation.',
      visit,
    };
  }

  async updateSiteVisitStatus(visitId: string, status: SiteVisitStatus) {
    const visit = this.siteVisits.get(visitId);
    if (!visit) {
      throw new NotFoundException('Site visit not found');
    }
    visit.status = status;
    this.siteVisits.set(visitId, visit);
    return {
      message: `Site visit status updated to ${status}`,
      visit,
    };
  }

  // Work Updates & Completion
  async submitWorkUpdate(workerId: string, dto: SubmitWorkUpdateDto) {
    const asgn = this.assignments.get(dto.assignmentId);
    if (!asgn) {
      throw new NotFoundException('Assignment record not found');
    }

    asgn.status = dto.status;
    const updateRecord = {
      id: `upd_${Date.now()}`,
      status: dto.status,
      notes: dto.notes,
      photoUrls: dto.photoUrls || [],
      submittedBy: workerId,
      timestamp: new Date().toISOString(),
    };

    if (!asgn.updates) asgn.updates = [];
    asgn.updates.push(updateRecord);
    this.assignments.set(dto.assignmentId, asgn);

    return {
      message:
        dto.status === AssignmentStatus.AWAITING_APPROVAL
          ? 'Work marked as completed. Awaiting customer inspection and approval.'
          : 'Work progress updated successfully.',
      assignmentStatus: asgn.status,
    };
  }

  // Customer Approval / Rejection
  async reviewCompletion(
    customerId: string,
    assignmentId: string,
    approved: boolean,
    feedback?: string,
  ) {
    const asgn = this.assignments.get(assignmentId);
    if (!asgn) {
      throw new NotFoundException('Assignment record not found');
    }

    if (approved) {
      asgn.status = AssignmentStatus.APPROVED;
      asgn.approvedAt = new Date().toISOString();
    } else {
      asgn.status = AssignmentStatus.WORK_IN_PROGRESS;
      asgn.rejectionFeedback = feedback || 'Customer requested revisions';
    }

    this.assignments.set(assignmentId, asgn);

    return {
      message: approved
        ? "Worker assignment approved! You can now rate the worker's performance."
        : 'Work returned for revision with comments.',
      assignmentStatus: asgn.status,
    };
  }

  // Rating & Review
  async submitReview(customerId: string, reviewDto: SubmitReviewDto) {
    const asgn = this.assignments.get(reviewDto.assignmentId);
    if (!asgn) {
      throw new NotFoundException('Assignment record not found');
    }

    if (asgn.status !== AssignmentStatus.APPROVED) {
      throw new BadRequestException('Can only review workers whose assignments are marked Approved');
    }

    const reviewId = `rev_${Date.now()}`;
    const review = {
      id: reviewId,
      assignmentId: reviewDto.assignmentId,
      workerId: asgn.workerId,
      customerId,
      rating: reviewDto.rating,
      reviewText: reviewDto.reviewText,
      punctualityScore: reviewDto.punctualityScore,
      workQualityScore: reviewDto.workQualityScore,
      behaviourScore: reviewDto.behaviourScore,
      photoUrls: reviewDto.photoUrls || [],
      createdAt: new Date().toISOString(),
    };

    this.reviews.set(reviewId, review);

    return {
      message: 'Thank you for rating your experience! Your review has been submitted.',
      review,
    };
  }
}
