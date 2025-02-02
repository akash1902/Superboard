export declare class EtherscanService {
    private readonly API_URLS;
    getABI(address: string, network: string): Promise<any>;
    getTransactions(address: string, network: string): Promise<any[]>;
}
