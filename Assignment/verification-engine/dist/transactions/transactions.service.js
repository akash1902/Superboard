"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
let TransactionsService = class TransactionsService {
    constructor() {
        this.providers = {};
    }
    getProvider(network) {
        if (!this.providers[network]) {
            const rpcUrl = this.getRpcUrl(network);
            this.providers[network] = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        }
        return this.providers[network];
    }
    getRpcUrl(network) {
        const urls = {
            ethereum: process.env.RPC_URL_ETH,
            polygon: process.env.RPC_URL_POLYGON,
            base: process.env.RPC_URL_BASE,
        };
        if (!urls[network]) {
            throw new Error(`Unsupported network: ${network}`);
        }
        return urls[network];
    }
    async parseTransaction(txHash, contract) {
        try {
            const provider = this.getProvider(contract.network);
            const [tx, txReceipt] = await Promise.all([
                provider.getTransaction(txHash),
                provider.getTransactionReceipt(txHash),
            ]);
            if (!tx || !txReceipt) {
                throw new common_1.NotFoundException(`Transaction not found for hash: ${txHash}`);
            }
            if (!contract?.abi?.length) {
                throw new Error(`No ABI available for contract ${contract.address}`);
            }
            const iface = new ethers_1.Interface(contract.abi);
            const parsedTx = iface.parseTransaction({
                data: tx.data,
                value: tx.value,
            });
            if (!parsedTx) {
                throw new Error('Failed to parse transaction data');
            }
            const parsedEvents = txReceipt.logs
                .map(log => {
                try {
                    const parsed = iface.parseLog(log);
                    if (parsed) {
                        return { name: parsed.name, args: this.mapArgsToRecord(parsed.args) };
                    }
                    return null;
                }
                catch (error) {
                    return null;
                }
            })
                .filter((event) => event !== null);
            return {
                function: parsedTx.name,
                events: parsedEvents,
            };
        }
        catch (error) {
            throw new Error(`Failed to parse transaction: ${error.message}`);
        }
    }
    mapArgsToRecord(args) {
        const result = {};
        for (const [key, value] of Object.entries(args)) {
            result[key] = value;
        }
        return result;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)()
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map