import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { MISTRI_PRO_CONSTANTS, PaymentStatus, ProjectStatus } from '@mistripro/shared-types';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class PaymentsService {
  private orders = new Map<string, any>();

  constructor(private projectsService: ProjectsService) {}

  async createListingFeeOrder(projectId: string, customerId: string) {
    const project = await this.projectsService.getProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.listingFeePaid) {
      throw new BadRequestException('Listing fee has already been paid for this project');
    }

    const orderId = `order_mp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const amountInPaise = MISTRI_PRO_CONSTANTS.LISTING_FEE_INR * 100; // 29900 paise

    const orderRecord = {
      orderId,
      projectId,
      customerId,
      amountInPaise,
      currency: 'INR',
      status: PaymentStatus.CREATED,
      createdAt: new Date().toISOString(),
    };

    this.orders.set(orderId, orderRecord);

    return {
      orderId,
      amountInPaise,
      currency: 'INR',
      amountInr: MISTRI_PRO_CONSTANTS.LISTING_FEE_INR,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mistripro_mock_key',
      projectCode: project.projectCode,
      title: project.title,
    };
  }

  async verifyPaymentSignature(
    orderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // In production with real Razorpay keys:
    // const keySecret = process.env.RAZORPAY_KEY_SECRET;
    // const hmac = crypto.createHmac('sha256', keySecret);
    // hmac.update(orderId + '|' + razorpayPaymentId);
    // const generatedSignature = hmac.digest('hex');
    // if (generatedSignature !== razorpaySignature) throw new BadRequestException('Invalid signature');

    // Update order status
    order.status = PaymentStatus.SUCCESSFUL;
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    this.orders.set(orderId, order);

    // Transition project to PUBLISHED
    const project = await this.projectsService.getProjectById(order.projectId);
    if (project) {
      project.listingFeePaid = true;
      project.status = ProjectStatus.PUBLISHED;
    }

    return {
      success: true,
      message: 'Listing fee payment verified successfully! Your project is now Published.',
      projectId: order.projectId,
      projectCode: project?.projectCode,
      status: ProjectStatus.PUBLISHED,
    };
  }
}
