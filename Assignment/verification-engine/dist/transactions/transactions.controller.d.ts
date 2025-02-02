import { TransactionsService } from './transactions.service';
import { ContractsService } from '../contracts/contracts.service';
import { Contract } from 'src/contracts/contract.entity';
import { Repository } from 'typeorm';
export declare class TransactionsController {
    private readonly transactionsService;
    private readonly contractsService;
    private readonly contractsRepository;
    constructor(transactionsService: TransactionsService, contractsService: ContractsService, contractsRepository: Repository<Contract>);
    testEndpoint(): {
        status: string;
    };
    parseTransaction(body: {
        txHash: string;
        contractId: string;
    }): Promise<{
        function: string;
        events: Array<{
            name: string;
            args: Record<string, any>;
        }>;
    }>;
}
