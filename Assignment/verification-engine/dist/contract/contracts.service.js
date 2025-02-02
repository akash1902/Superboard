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
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contract_entity_1 = require("./contract.entity");
const etherscan_service_1 = require("../common/etherscan.service");
const ethers_1 = require("ethers");
let ContractsService = class ContractsService {
    constructor(contractsRepository, etherscanService) {
        this.contractsRepository = contractsRepository;
        this.etherscanService = etherscanService;
    }
    async createContract(contractData) {
        const contract = this.contractsRepository.create(contractData);
        try {
            const abiObj = await this.etherscanService.getABI(contract.address, contract.network);
            contract.abi = JSON.stringify(abiObj);
        }
        catch (error) {
            console.error("Error fetching ABI during creation:", error);
        }
        const savedContract = await this.contractsRepository.save(contract);
        return savedContract;
    }
    async analyzeContractTransactions(contractId) {
        const contract = await this.contractsRepository.findOneBy({ id: contractId });
        if (!contract)
            throw new common_1.NotFoundException('Contract not found');
        if (!contract.abi) {
            const abiObj = await this.etherscanService.getABI(contract.address, contract.network);
            contract.abi = JSON.stringify(abiObj);
            await this.contractsRepository.save(contract);
        }
        const transactions = await this.etherscanService.getTransactions(contract.address, contract.network);
        contract.transactions = transactions;
        await this.contractsRepository.save(contract);
        let abiForInterface;
        try {
            abiForInterface = JSON.parse(contract.abi);
        }
        catch (error) {
            console.error("Error parsing stored ABI. Re-fetching ABI.", { storedABI: contract.abi, error });
            const freshAbiObj = await this.etherscanService.getABI(contract.address, contract.network);
            contract.abi = JSON.stringify(freshAbiObj);
            await this.contractsRepository.save(contract);
            try {
                abiForInterface = JSON.parse(contract.abi);
            }
            catch (err) {
                throw new common_1.InternalServerErrorException('Failed to parse contract ABI after re-fetching.');
            }
        }
        const iface = new ethers_1.Interface(abiForInterface);
        const methodCategories = {
            swap: ['swap', 'exchange'],
            bridge: ['bridge', 'crosschaintransfer', 'deposittobridge', 'withdrawfrombridge'],
            trading: ['buy', 'sell', 'trade', 'placeorder', 'executeorder'],
            provideLiquidity: ['addliquidity', 'provideliquidity', 'depositliquidity'],
            removeLiquidity: ['removeliquidity', 'withdrawliquidity'],
            staking: ['stake', 'unstake', 'deposit'],
            yieldFarming: ['enterfarm', 'exitfarm', 'harvest'],
            claimRewards: ['claim', 'withdrawrewards', 'claimrewards'],
            borrowing: ['borrow', 'repay', 'liquidate'],
            lending: ['lend', 'supply', 'deposit', 'withdraw'],
            nftMinting: ['mint', 'mintnft'],
            nftBurning: ['burnnft', 'burn'],
            nftTransfer: ['transfer', 'safetransferfrom'],
            nftBuySell: ['buynft', 'sellnft', 'purchase', 'bid', 'acceptbid'],
            voting: ['vote', 'propose', 'delegate'],
            governanceVoting: ['castvote', 'submitproposal', 'delegatevotes'],
            airdropClaim: ['claimairdrop', 'redeemairdrop'],
            burning: ['burn']
        };
        const categories = new Set();
        transactions.forEach((tx) => {
            try {
                const parsedTx = iface.parseTransaction({ data: tx.input });
                if (parsedTx && parsedTx.name) {
                    const txName = parsedTx.name.toLowerCase();
                    for (const [category, methodsList] of Object.entries(methodCategories)) {
                        if (methodsList.includes(txName)) {
                            categories.add(category);
                        }
                    }
                }
            }
            catch (error) {
            }
        });
        return {
            contractAddress: contract.address,
            methods: Array.from(categories),
            totalTransactions: transactions.length,
        };
    }
    async evaluateTransaction(evaluationData) {
        const { contractId, functionName, minAmount } = evaluationData;
        const contract = await this.contractsRepository.findOneBy({ id: contractId });
        if (!contract)
            throw new common_1.NotFoundException('Contract not found');
        if (!contract.abi) {
            const abiObj = await this.etherscanService.getABI(contract.address, contract.network);
            contract.abi = JSON.stringify(abiObj);
            await this.contractsRepository.save(contract);
        }
        let abiForInterface;
        try {
            abiForInterface = JSON.parse(contract.abi);
        }
        catch (error) {
            console.error("Error parsing stored ABI in evaluateTransaction. Re-fetching ABI.", { storedABI: contract.abi, error });
            const freshAbiObj = await this.etherscanService.getABI(contract.address, contract.network);
            contract.abi = JSON.stringify(freshAbiObj);
            await this.contractsRepository.save(contract);
            try {
                abiForInterface = JSON.parse(contract.abi);
            }
            catch (err) {
                throw new common_1.InternalServerErrorException('Failed to parse contract ABI after re-fetching.');
            }
        }
        const iface = new ethers_1.Interface(abiForInterface);
        let foundMatch = false;
        let foundTransactionAmount = null;
        for (const tx of contract.transactions || []) {
            try {
                const parsedTx = iface.parseTransaction({ data: tx.input });
                if (parsedTx && parsedTx.name === functionName) {
                    if (minAmount === undefined || minAmount === null) {
                        foundMatch = true;
                        break;
                    }
                    else {
                        const inputs = parsedTx.fragment.inputs;
                        let actualAmount;
                        for (let i = 0; i < inputs.length; i++) {
                            const paramName = inputs[i].name.toLowerCase();
                            if (paramName.includes('amount') || (functionName.toLowerCase() === 'nftbuysell' && paramName.includes('price'))) {
                                actualAmount = parsedTx.args[i];
                                break;
                            }
                        }
                        if (actualAmount !== undefined) {
                            const actual = Number(actualAmount.toString());
                            if (actual >= minAmount) {
                                foundMatch = true;
                                break;
                            }
                            else {
                                foundTransactionAmount = actual;
                            }
                        }
                    }
                }
            }
            catch (error) {
            }
        }
        let message = '';
        if (foundMatch) {
            message = 'Matching transaction found in contract history meeting the minimum amount requirement.';
        }
        else {
            if (minAmount !== undefined && foundTransactionAmount !== null) {
                message = `A transaction was found with amount ${foundTransactionAmount}, which is below the required minimum of ${minAmount}.`;
            }
            else {
                message = 'No matching transaction found in contract history.';
            }
        }
        return {
            meetsCondition: foundMatch,
            message,
        };
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contract_entity_1.Contract)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        etherscan_service_1.EtherscanService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map