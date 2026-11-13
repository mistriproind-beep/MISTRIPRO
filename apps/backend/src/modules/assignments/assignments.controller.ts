import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import {
  CreateSiteVisitDto,
  SubmitWorkUpdateDto,
  SubmitReviewDto,
  SiteVisitStatus,
} from '@mistripro/shared-types';

@ApiTags('Assignments & Work Tracking')
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get worker assignment details and progress history' })
  getAssignment(@Param('id') id: string) {
    return this.assignmentsService.getAssignment(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('site-visits')
  @ApiOperation({ summary: 'Schedule site visit appointment' })
  scheduleSiteVisit(@Body() dto: CreateSiteVisitDto) {
    return this.assignmentsService.scheduleSiteVisit(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('site-visits/:id/status')
  @ApiOperation({ summary: 'Update site visit status (Confirm, Reschedule, Complete)' })
  updateVisitStatus(@Param('id') visitId: string, @Body('status') status: SiteVisitStatus) {
    return this.assignmentsService.updateSiteVisitStatus(visitId, status);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('updates')
  @ApiOperation({ summary: 'Worker: Upload progress notes & before/after completion photos' })
  submitUpdate(@CurrentUser() user: any, @Body() dto: SubmitWorkUpdateDto) {
    return this.assignmentsService.submitWorkUpdate(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/review-completion')
  @ApiOperation({ summary: 'Customer: Accept completion or request revisions' })
  reviewCompletion(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('approved') approved: boolean,
    @Body('feedback') feedback?: string,
  ) {
    return this.assignmentsService.reviewCompletion(user.userId, id, approved, feedback);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('reviews')
  @ApiOperation({ summary: 'Customer: Rate worker (1-5 stars) upon approved completion' })
  submitReview(@CurrentUser() user: any, @Body() reviewDto: SubmitReviewDto) {
    return this.assignmentsService.submitReview(user.userId, reviewDto);
  }
}
