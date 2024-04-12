import { Injectable } from '@nestjs/common';
import { BiconomyGaslessWithViem } from './utils/biconomy-with-viem';
import { CreateTransferType } from './dtos/CreateUser.dto';
import { BiconomyTransferUsingEther } from './utils/biconomy-gasless-with-ethers';

@Injectable()
export class AppService {
  constructor(
    private biconomy: BiconomyGaslessWithViem,
    private biconomyEther: BiconomyTransferUsingEther,
  ) {}

  getHello(): string {
    return 'Hello World! welcome to Zyde';
  }

  async transferUSDC(data: CreateTransferType) {
    try {
      const response = await this.biconomy.transferUSDC(
        data.amount,
        data.receipient,
      );
      console.log(response);
      return { transactionHash: response };
    } catch (err) {
      console.log(err);
    }
  }

  async transferUSDCEtherOption(data: CreateTransferType) {
    try {
      const response = await this.biconomyEther.transferUSDC(
        data.amount,
        data.receipient,
      );
      console.log(response);
      return { transactionHash: response };
    } catch (err) {
      console.log(err);
    }
  }
}
