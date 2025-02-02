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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const contracts_service_1 = require("../contracts/contracts.service");
const contract_entity_1 = require("../contracts/contract.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let TransactionsController = class TransactionsController {
    constructor(transactionsService, contractsService, contractsRepository) {
        this.transactionsService = transactionsService;
        this.contractsService = contractsService;
        this.contractsRepository = contractsRepository;
    }
    testEndpoint() {
        return { status: 'Transactions controller is working!' };
    }
    async parseTransaction(body) {
        try {
            const contract = await this.contractsRepository.findOneBy({ id: body.contractId });
            if (!contract) {
                throw new common_1.NotFoundException('Contract not found');
            }
            return await this.transactionsService.parseTransaction(body.txHash, contract);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new Error(`Error parsing transaction: ${error.message}`);
        }
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "testEndpoint", null);
__decorate([
    (0, common_1.Post)('parse'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "parseTransaction", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)('transactions'),
    __param(2, (0, typeorm_1.InjectRepository)(contract_entity_1.Contract)),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService,
        contracts_service_1.ContractsService,
        typeorm_2.Repository])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map