import { Repository } from 'typeorm';
import { Verification } from './verification.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateVerificationDto } from './dto/create-verification.dto';
export declare class VerificationsService {
    private verificationsRepository;
    private transactionsService;
    constructor(verificationsRepository: Repository<Verification>, transactionsService: TransactionsService);
    validateActivity(verificationId: string, txHash: string): Promise<{
        isValid: boolean;
        details: {
            function: string;
            events: Array<{
                name: string;
                args: Record<string, any>;
            }>;
        };
    }>;
    private checkConditions;
    createVerification(verificationData: CreateVerificationDto): Promise<{
        createdAt: Date;
        name: string;
        description: string;
        ruleType: string;
        parameters: Record<string, any>;
        contractId: string;
    } & Verification>;
}
