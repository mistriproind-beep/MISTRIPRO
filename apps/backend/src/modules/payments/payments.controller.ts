import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CurrentUser } from '../../common/auth/current-user.decorator';

@ApiTags('Payments & Listing Fees')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('create-order')
  @ApiOperation({ summary: 'Create Razorpay order for ₹299 listing fee' })
  async createOrder(@CurrentUser() user: any, @Body('projectId') projectId: string) {
    return this.paymentsService.createListingFeeOrder(projectId, user.userId);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify Razorpay server-side signature and publish project' })
  async verifyPayment(
    @Body('orderId') orderId: string,
    @Body('razorpayPaymentId') razorpayPaymentId: string,
    @Body('razorpaySignature') razorpaySignature: string,
  ) {
    return this.paymentsService.verifyPaymentSignature(
      orderId,
      razorpayPaymentId,
      razorpaySignature,
    );
  }
}
