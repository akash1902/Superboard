import { Repository } from 'typeorm';
import { Contract } from './contract.entity';
import { EtherscanService } from '../common/etherscan.service';
import { EvaluateTransactionDto } from './dto/evaluation.dto';
export declare class ContractsService {
    private contractsRepository;
    private etherscanService;
    constructor(contractsRepository: Repository<Contract>, etherscanService: EtherscanService);
    createContract(contractData: Partial<Contract>): Promise<Contract>;
    analyzeContractTransactions(contractId: string): Promise<{
        contractAddress: string;
        methods: string[];
        totalTransactions: number;
    }>;
    evaluateTransaction(evaluationData: EvaluateTransactionDto): Promise<{
        meetsCondition: boolean;
        message: string;
    }>;
}
