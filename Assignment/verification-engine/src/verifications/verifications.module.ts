import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Verification } from './verification.entity';
import { VerificationsController } from './verifications.controller';
import { VerificationsService } from './verifications.service';
import { ContractsModule } from '../contracts/contracts.module'; // Import ContractsModule if needed
import { TransactionsModule } from 'src/transactions/transactions.module';
import { TransactionsService } from 'src/transactions/transactions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Verification]),
    ContractsModule, // Include if verifications depend on contracts
    TransactionsModule  
  ],
  controllers: [VerificationsController],
  providers: [VerificationsService],
  exports: [VerificationsService],
})
export class VerificationsModule {}