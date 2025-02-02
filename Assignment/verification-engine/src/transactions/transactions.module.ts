import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { ContractsModule } from '../contracts/contracts.module';
import { Contract } from '../contracts/contract.entity'; // Import Contract entity

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract]), // Register Contract entity
    ContractsModule, // Import ContractsModule to use ContractsService
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService], // Export TransactionsService for use in other modules
})
export class TransactionsModule {}
