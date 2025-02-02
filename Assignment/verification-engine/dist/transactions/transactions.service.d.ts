import { Contract } from '../contracts/contract.entity';
export declare class TransactionsService {
    private readonly providers;
    private getProvider;
    private getRpcUrl;
    parseTransaction(txHash: string, contract: Contract): Promise<{
        function: string;
        events: Array<{
            name: string;
            args: Record<string, any>;
        }>;
    }>;
    private mapArgsToRecord;
}
