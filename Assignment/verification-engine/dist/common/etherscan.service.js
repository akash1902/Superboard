"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EtherscanService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let EtherscanService = class EtherscanService {
    constructor() {
        this.API_URLS = {
            ethereum: 'https://api.etherscan.io/api',
            polygon: 'https://api.polygonscan.com/api',
            base: 'https://api.basescan.org/api',
        };
    }
    async getABI(address, network) {
        if (!this.API_URLS[network]) {
            throw new common_1.BadRequestException(`Unsupported network: ${network}`);
        }
        try {
            const response = await axios_1.default.get(this.API_URLS[network], {
                params: {
                    module: 'contract',
                    action: 'getabi',
                    address,
                    apikey: process.env.ETHERSCAN_API_KEY,
                },
            });
            if (response.data.status !== '1') {
                throw new common_1.BadRequestException(`Error fetching ABI: ${response.data.message || 'Unknown error'}`);
            }
            return JSON.parse(response.data.result);
        }
        catch (error) {
            console.error(`Failed to fetch ABI for ${address} on ${network}:`, error);
            throw new common_1.InternalServerErrorException('Failed to retrieve contract ABI.');
        }
    }
    async getTransactions(address, network) {
        if (!this.API_URLS[network]) {
            throw new common_1.BadRequestException(`Unsupported network: ${network}`);
        }
        try {
            const response = await axios_1.default.get(this.API_URLS[network], {
                params: {
                    module: 'account',
                    action: 'txlist',
                    address,
                    startblock: 0,
                    endblock: 99999999,
                    sort: 'desc',
                    apikey: process.env.ETHERSCAN_API_KEY,
                },
            });
            if (response.data.status !== '1') {
                throw new common_1.BadRequestException(`Error fetching transactions: ${response.data.message || 'Unknown error'}`);
            }
            return response.data.result;
        }
        catch (error) {
            console.error(`Failed to fetch transactions for ${address} on ${network}:`, error);
            throw new common_1.InternalServerErrorException('Failed to retrieve contract transactions.');
        }
    }
};
exports.EtherscanService = EtherscanService;
exports.EtherscanService = EtherscanService = __decorate([
    (0, common_1.Injectable)()
], EtherscanService);
//# sourceMappingURL=etherscan.service.js.map