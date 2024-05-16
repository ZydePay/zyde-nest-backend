import { Injectable } from '@nestjs/common';
import { BiconomyGaslessWithViem } from './helpers/biconomy-with-viem';
import { CreateTransferType } from './dtos/CreateUser.dto';
import { BiconomyTransferUsingEther } from './helpers/biconomy-gasless-with-ethers';

@Injectable()
export class AppService {
  constructor(
    private biconomy: BiconomyGaslessWithViem,
    private biconomyEther: BiconomyTransferUsingEther,
  ) {}

  getHello(): string {
    return 'Hello World! welcome to Zyde';
  }

  async transferUSDT(data: CreateTransferType) {
    try {
      const response = await this.biconomy.transferUSDT(
        data.amount,
        data.receipient,
        data.privateKey,
      );
      console.log(response);
      return { transactionHash: response };
    } catch (err) {
      console.log(err);
      return { error: err };
    }
  }

  async transferUSDTEtherOption(data: CreateTransferType) {
    try {
      const response = await this.biconomyEther.transferUSDT(
        data.amount,
        data.receipient,
        data.privateKey,
      );
      console.log(response);
      return { transactionHash: response };
    } catch (err) {
      console.log(err);
      return { error: err };
    }
  }
}
