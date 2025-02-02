import { Body, Controller, Post } from '@nestjs/common';
import { VerificationsService } from './verifications.service';
import { Verification } from './verification.entity';
import { CreateVerificationDto } from './dto/create-verification.dto';

@Controller('verifications')
export class VerificationsController {
  constructor(private readonly verificationsService: VerificationsService) {}

  @Post()
  async create(@Body() verificationData: CreateVerificationDto) {
    console.log('Verification Request - ' , verificationData);
    return this.verificationsService.createVerification({
      ...verificationData,
      // Add proper typing for your DTO
      ruleType: verificationData.ruleType,
      parameters: verificationData.parameters
    });
  }
}