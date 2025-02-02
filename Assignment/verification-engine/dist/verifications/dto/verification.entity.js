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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verification = void 0;
const typeorm_1 = require("typeorm");
const contract_entity_1 = require("../contracts/contract.entity");
let Verification = class Verification {
};
exports.Verification = Verification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Verification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Verification.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ enum: ['swap', 'staking', 'nft-transfer',] }),
    __metadata("design:type", String)
], Verification.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Verification.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => contract_entity_1.Contract),
    __metadata("design:type", contract_entity_1.Contract)
], Verification.prototype, "contract", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], Verification.prototype, "conditions", void 0);
exports.Verification = Verification = __decorate([
    (0, typeorm_1.Entity)()
], Verification);
//# sourceMappingURL=verification.entity.js.map