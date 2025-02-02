import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Verification } from './verification.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateVerificationDto } from './dto/create-verification.dto';

@Injectable()
export class VerificationsService {
  constructor(
    @InjectRepository(Verification)
    private verificationsRepository: Repository<Verification>,
    private transactionsService: TransactionsService,
  ) {}

  async validateActivity(verificationId: string, txHash: string) {
    const verification = await this.verificationsRepository.findOne({
      where: { id: verificationId },
      relations: ['contract'],
    });
  
    if (!verification) {
      throw new Error('Verification not found');
    }
  
    const txData = await this.transactionsService.parseTransaction(
      txHash,
      verification.contract,
    );
  
    const isValid = this.checkConditions(txData, verification.conditions);
    return { isValid, details: txData };
  }

  private checkConditions(txData: any, conditions: any): boolean {
    // Example: Check minimum token amount
    if (conditions.minAmount) {
      return txData.function.args.amount >= conditions.minAmount;
    }
    return true;
  }

  async createVerification(verificationData: CreateVerificationDto) {
    return this.verificationsRepository.save({
      ...verificationData,
      createdAt: new Date()
    });
  }


}