import { Injectable, NotFoundException } from '@nestjs/common';
import { ethers, Interface, TransactionReceipt, TransactionResponse } from 'ethers';
import { Contract } from '../contracts/contract.entity';

@Injectable()
export class TransactionsService {
  private readonly providers: Record<string, ethers.JsonRpcProvider> = {};

  private getProvider(network: string): ethers.JsonRpcProvider {
    if (!this.providers[network]) {
      const rpcUrl = this.getRpcUrl(network);
      this.providers[network] = new ethers.JsonRpcProvider(rpcUrl);
    }
    return this.providers[network];
  }

  private getRpcUrl(network: string): string {
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

  async parseTransaction(
    txHash: string, 
    contract: Contract
  ): Promise<{
    function: string;
    events: Array<{ name: string; args: Record<string, any> }>;
  }> {
    try {
      const provider = this.getProvider(contract.network);
      
      const [tx, txReceipt] = await Promise.all([
        provider.getTransaction(txHash) as Promise<TransactionResponse>,
        provider.getTransactionReceipt(txHash) as Promise<TransactionReceipt>,
      ]);

      if (!tx || !txReceipt) {
        throw new NotFoundException(`Transaction not found for hash: ${txHash}`);
      }

      if (!contract?.abi?.length) {
        throw new Error(`No ABI available for contract ${contract.address}`);
      }

      const iface = new Interface(contract.abi);
      const parsedTx = iface.parseTransaction({
        data: tx.data,
        value: tx.value,
      });

      // Check if parsedTx is null
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
          } catch (error) {
            return null;
          }
        })
        .filter((event): event is { name: string; args: Record<string, any> } => event !== null); // Type guard to remove null

      return {
        function: parsedTx.name,
        events: parsedEvents,
      };
    } catch (error) {
      throw new Error(`Failed to parse transaction: ${error.message}`);
    }
  }

  // Helper function to map ethers.Result to Record<string, any>
  private mapArgsToRecord(args: ethers.Result): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(args)) {
      result[key] = value;
    }
    return result;
  }
}
