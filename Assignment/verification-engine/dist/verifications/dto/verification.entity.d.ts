import { Contract } from '../contracts/contract.entity';
export declare class Verification {
    id: string;
    name: string;
    category: string;
    description: string;
    contract: Contract;
    conditions: Record<string, any>;
}
