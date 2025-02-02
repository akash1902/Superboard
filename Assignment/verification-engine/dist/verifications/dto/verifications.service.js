"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const verification_entity_1 = require("./verification.entity");
const transactions_service_1 = require("../transactions/transactions.service");
let VerificationsService = class VerificationsService {
    constructor(verificationsRepository, transactionsService) {
        this.verificationsRepository = verificationsRepository;
        this.transactionsService = transactionsService;
    }
    async validateActivity(verificationId, txHash) {
        const verification = await this.verificationsRepository.findOne({
            where: { id: verificationId },
            relations: ['contract'],
        });
        if (!verification) {
            throw new Error('Verification not found');
        }
        const txData = await this.transactionsService.parseTransaction(txHash, verification.contract);
        const isValid = this.checkConditions(txData, verification.conditions);
        return { isValid, details: txData };
    }
    checkConditions(txData, conditions) {
        if (conditions.minAmount) {
            return txData.function.args.amount >= conditions.minAmount;
        }
        return true;
    }
    async createVerification(verificationData) {
        return this.verificationsRepository.save({
            ...verificationData,
            createdAt: new Date()
        });
    }
};
exports.VerificationsService = VerificationsService;
exports.VerificationsService = VerificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(verification_entity_1.Verification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        transactions_service_1.TransactionsService])
], VerificationsService);
//# sourceMappingURL=verifications.service.js.map