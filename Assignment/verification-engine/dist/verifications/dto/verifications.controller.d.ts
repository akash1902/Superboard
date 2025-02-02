import { VerificationsService } from './verifications.service';
import { Verification } from './verification.entity';
import { CreateVerificationDto } from './dto/create-verification.dto';
export declare class VerificationsController {
    private readonly verificationsService;
    constructor(verificationsService: VerificationsService);
    create(verificationData: CreateVerificationDto): Promise<{
        createdAt: Date;
        name: string;
        description: string;
        ruleType: string;
        parameters: Record<string, any>;
        contractId: string;
    } & Verification>;
}
