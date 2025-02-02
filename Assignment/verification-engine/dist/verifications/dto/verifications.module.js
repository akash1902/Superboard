"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const verification_entity_1 = require("./verification.entity");
const verifications_controller_1 = require("./verifications.controller");
const verifications_service_1 = require("./verifications.service");
const contracts_module_1 = require("../contracts/contracts.module");
const transactions_module_1 = require("../transactions/transactions.module");
let VerificationsModule = class VerificationsModule {
};
exports.VerificationsModule = VerificationsModule;
exports.VerificationsModule = VerificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([verification_entity_1.Verification]),
            contracts_module_1.ContractsModule,
            transactions_module_1.TransactionsModule
        ],
        controllers: [verifications_controller_1.VerificationsController],
        providers: [verifications_service_1.VerificationsService],
        exports: [verifications_service_1.VerificationsService],
    })
], VerificationsModule);
//# sourceMappingURL=verifications.module.js.map