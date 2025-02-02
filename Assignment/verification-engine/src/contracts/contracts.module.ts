import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './contract.entity';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { EtherscanModule } from '../common/etherscan.module'; 

@Module({
  imports: [TypeOrmModule.forFeature([Contract]) , EtherscanModule],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService], // Optional: Export service if needed elsewhere
})
export class ContractsModule {}