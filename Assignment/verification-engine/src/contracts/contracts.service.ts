// src/contracts/contracts.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './contract.entity';
import { EtherscanService } from '../common/etherscan.service';
import { Interface } from 'ethers';
import { EvaluateTransactionDto } from './dto/evaluation.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private contractsRepository: Repository<Contract>,
    private etherscanService: EtherscanService,
  ) {}

  async createContract(contractData: Partial<Contract>) {
    const contract = this.contractsRepository.create(contractData);
    // Attempt to fetch and store the contract ABI
    try {
      const abiObj = await this.etherscanService.getABI(contract.address, contract.network);
      // Store the ABI as a JSON string
      contract.abi = JSON.stringify(abiObj);
    } catch (error) {
      console.error("Error fetching ABI during creation:", error);
    }
    const savedContract = await this.contractsRepository.save(contract);
    return savedContract;
  }

  async analyzeContractTransactions(contractId: string) {
    const contract = await this.contractsRepository.findOneBy({ id: contractId });
    if (!contract) throw new NotFoundException('Contract not found');
  
    if (!contract.abi) {
      const abiObj = await this.etherscanService.getABI(contract.address, contract.network);
      contract.abi = JSON.stringify(abiObj);
      await this.contractsRepository.save(contract);
    }
  
    const transactions = await this.etherscanService.getTransactions(contract.address, contract.network);
    // Persist transactions in the database (stored as JSON)
    contract.transactions = transactions;
    await this.contractsRepository.save(contract);
  
    // Attempt to parse the ABI (which is stored as a JSON string)
    let abiForInterface: any;
    try {
      abiForInterface = JSON.parse(contract.abi);
    } catch (error) {
      console.error("Error parsing stored ABI. Re-fetching ABI.", { storedABI: contract.abi, error });
      const freshAbiObj = await this.etherscanService.getABI(contract.address, contract.network);
      contract.abi = JSON.stringify(freshAbiObj);
      await this.contractsRepository.save(contract);
      try {
        abiForInterface = JSON.parse(contract.abi);
      } catch (err) {
        throw new InternalServerErrorException('Failed to parse contract ABI after re-fetching.');
      }
    }
  
    const iface = new Interface(abiForInterface);
  
    // Define mapping from our allowed verification categories to possible function names
    const methodCategories: Record<string, string[]> = {
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
  
    const categories = new Set<string>();
  
    // Iterate through each transaction and attempt to decode the function call
    transactions.forEach((tx) => {
      try {
        const parsedTx = iface.parseTransaction({ data: tx.input });
        if (parsedTx && parsedTx.name) {
          const txName = parsedTx.name.toLowerCase();
          // Compare the decoded function name to each allowed category's list.
          for (const [category, methodsList] of Object.entries(methodCategories)) {
            if (methodsList.includes(txName)) {
              categories.add(category);
            }
          }
        }
      } catch (error) {
        // Ignore any transactions that cannot be parsed
      }
    });
  
    return {
      contractAddress: contract.address,
      methods: Array.from(categories),
      totalTransactions: transactions.length,
    };
  }
  
  async evaluateTransaction(evaluationData: EvaluateTransactionDto) {
    // Expecting evaluationData to include contractId, functionName, and optionally minAmount
    const { contractId, functionName, minAmount } = evaluationData;
    const contract = await this.contractsRepository.findOneBy({ id: contractId });
    if (!contract) throw new NotFoundException('Contract not found');
  
    if (!contract.abi) {
      const abiObj = await this.etherscanService.getABI(contract.address, contract.network);
      contract.abi = JSON.stringify(abiObj);
      await this.contractsRepository.save(contract);
    }
  
    let abiForInterface: any;
    try {
      abiForInterface = JSON.parse(contract.abi);
    } catch (error) {
      console.error("Error parsing stored ABI in evaluateTransaction. Re-fetching ABI.", { storedABI: contract.abi, error });
      const freshAbiObj = await this.etherscanService.getABI(contract.address, contract.network);
      contract.abi = JSON.stringify(freshAbiObj);
      await this.contractsRepository.save(contract);
      try {
        abiForInterface = JSON.parse(contract.abi);
      } catch (err) {
        throw new InternalServerErrorException('Failed to parse contract ABI after re-fetching.');
      }
    }
    
    const iface = new Interface(abiForInterface);
    let foundMatch = false;
    let foundTransactionAmount: number | null = null;
  
    // Iterate through transactions stored on the contract
    for (const tx of contract.transactions || []) {
      try {
        const parsedTx = iface.parseTransaction({ data: tx.input });
        if (parsedTx && parsedTx.name === functionName) {
          // If no minimum amount was specified, we simply mark it as a match.
          if (minAmount === undefined || minAmount === null) {
            foundMatch = true;
            break;
          } else {
            // Use the updated property name: "fragment" instead of "functionFragment"
            const inputs = parsedTx.fragment.inputs;
            let actualAmount: any;
            for (let i = 0; i < inputs.length; i++) {
              const paramName = inputs[i].name.toLowerCase();
              // Check for 'amount' (or 'price' for nftbuysell) in parameter names
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
              } else {
                foundTransactionAmount = actual;
              }
            }
          }
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }
  
    let message = '';
    if (foundMatch) {
      message = 'Matching transaction found in contract history meeting the minimum amount requirement.';
    } else {
      if (minAmount !== undefined && foundTransactionAmount !== null) {
        message = `A transaction was found with amount ${foundTransactionAmount}, which is below the required minimum of ${minAmount}.`;
      } else {
        message = 'No matching transaction found in contract history.';
      }
    }
    return {
      meetsCondition: foundMatch,
      message,
    };
  }
  
}
