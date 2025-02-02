export declare class EvaluateTransactionDto {
    contractId: string;
    functionName: string;
    parameters: Record<string, any>;
    transactionHash: string;
    minAmount?: number;
}
