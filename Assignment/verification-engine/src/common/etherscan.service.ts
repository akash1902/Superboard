// src/common/etherscan.service.ts
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EtherscanService {
  private readonly API_URLS: Record<string, string> = {
    ethereum: 'https://api.etherscan.io/api',
    polygon: 'https://api.polygonscan.com/api',
    base: 'https://api.basescan.org/api',
  };

  async getABI(address: string, network: string): Promise<any> {
    if (!this.API_URLS[network]) {
      throw new BadRequestException(`Unsupported network: ${network}`);
    }

    try {
      const response = await axios.get(this.API_URLS[network], {
        params: {
          module: 'contract',
          action: 'getabi',
          address,
          apikey: process.env.ETHERSCAN_API_KEY,
        },
      });

      if (response.data.status !== '1') {
        throw new BadRequestException(
          `Error fetching ABI: ${response.data.message || 'Unknown error'}`
        );
      }

      return JSON.parse(response.data.result);
    } catch (error) {
      console.error(`Failed to fetch ABI for ${address} on ${network}:`, error);
      throw new InternalServerErrorException('Failed to retrieve contract ABI.');
    }
  }

  async getTransactions(address: string, network: string): Promise<any[]> {
    if (!this.API_URLS[network]) {
      throw new BadRequestException(`Unsupported network: ${network}`);
    }

    try {
      const response = await axios.get(this.API_URLS[network], {
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
        throw new BadRequestException(
          `Error fetching transactions: ${response.data.message || 'Unknown error'}`
        );
      }

      return response.data.result;
    } catch (error) {
      console.error(`Failed to fetch transactions for ${address} on ${network}:`, error);
      throw new InternalServerErrorException('Failed to retrieve contract transactions.');
    }
  }
}
