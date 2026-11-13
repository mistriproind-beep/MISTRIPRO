import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import {
  CreateProjectDto,
  WorkerApplicationSubmitDto,
  MASTER_SKILL_CATEGORIES,
} from '@mistripro/shared-types';

@ApiTags('Projects & Work Requirements')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('skills')
  @ApiOperation({ summary: 'List all 21 master construction skills' })
  getSkills() {
    return MASTER_SKILL_CATEGORIES;
  }

  @Get('feed')
  @ApiOperation({ summary: 'Worker job discovery feed (published requirements)' })
  listFeed(@Query('skill') skill?: string, @Query('city') city?: string) {
    return this.projectsService.listFeedProjects(skill, city);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full project requirement details by ID' })
  getProject(@Param('id') id: string) {
    return this.projectsService.getProjectById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Customer: Create work requirement / tender' })
  createProject(@CurrentUser() user: any, @Body() createDto: CreateProjectDto) {
    return this.projectsService.createProject(user.userId, createDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('apply')
  @ApiOperation({ summary: 'Worker: Apply for specific project vacancy' })
  apply(@CurrentUser() user: any, @Body() applyDto: WorkerApplicationSubmitDto) {
    return this.projectsService.applyToRequirement(user.userId, applyDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/requirements/:reqId/select-worker')
  @ApiOperation({ summary: 'Customer: Select worker for vacancy' })
  selectWorker(
    @CurrentUser() user: any,
    @Param('id') projectId: string,
    @Param('reqId') requirementId: string,
    @Body('workerId') workerId: string,
  ) {
    return this.projectsService.selectWorker(user.userId, projectId, requirementId, workerId);
  }
}
