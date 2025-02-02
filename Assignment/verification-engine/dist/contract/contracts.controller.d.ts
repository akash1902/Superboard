import { ContractsService } from './contracts.service';
import { EvaluateTransactionDto } from './dto/evaluation.dto';
import { Contract } from './contract.entity';
export declare class ContractsController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
    create(contractData: Partial<Contract>): Promise<Contract>;
    analyzeTransactions(contractId: string): Promise<{
        contractAddress: string;
        methods: string[];
        totalTransactions: number;
    }>;
    evaluateTransaction(evaluationData: EvaluateTransactionDto): Promise<{
        meetsCondition: boolean;
        message: string;
    }>;
}
