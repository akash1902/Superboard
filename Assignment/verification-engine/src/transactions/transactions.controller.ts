// src/transactions/transactions.controller.ts
import { Body, Controller, Post, NotFoundException, Get } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ContractsService } from '../contracts/contracts.service';
import { Contract } from 'src/contracts/contract.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly contractsService: ContractsService,
    @InjectRepository(Contract)
    private readonly contractsRepository: Repository<Contract>,
  ) {}

  @Get('test')
  testEndpoint() {
    return { status: 'Transactions controller is working!' };
  }

  @Post('parse')
  async parseTransaction(
    @Body() body: { txHash: string; contractId: string }
  ) {
    try {
      const contract = await this.contractsRepository.findOneBy({ id: body.contractId });
      if (!contract) {
        throw new NotFoundException('Contract not found');
      }
      return await this.transactionsService.parseTransaction(body.txHash, contract);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error parsing transaction: ${error.message}`);
    }
  }
}
