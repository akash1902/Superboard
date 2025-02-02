// src/contracts/contracts.controller.ts
import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { EvaluateTransactionDto } from './dto/evaluation.dto';
import { Contract } from './contract.entity';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  async create(@Body() contractData: Partial<Contract>) {
    return this.contractsService.createContract(contractData);
  }

  @Get(':contractId/transactions')
  async analyzeTransactions(@Param('contractId') contractId: string) {
    return this.contractsService.analyzeContractTransactions(contractId);
  }

  @Post('evaluate')
  async evaluateTransaction(@Body() evaluationData: EvaluateTransactionDto) {
    return this.contractsService.evaluateTransaction(evaluationData);
  }
}
