import { AarcCore } from '@aarc-xyz/core';
import { ethers, Wallet } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Hex } from 'viem';

@Injectable()
export class AarcTransfer {
  constructor(private configService: ConfigService) {}
  arcAPIKey = this.configService.get('ARC_API_KEY');

  aarcSDK = new AarcCore(this.arcAPIKey);

  gaslessTransferToSmartAccount = async (
    smartAccountAddress: string,
    amount: number,
    privateKey: string,
    alchemyMainnetRPC: string,
  ) => {
    const provider = new ethers.JsonRpcProvider(alchemyMainnetRPC);
    const wallet = new Wallet(privateKey || '', provider);
    console.log('provider', provider);

    const PolygonUSDCTokenAddress =
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // USDC Proxy address

    // Amount to transfer
    const transferAmount = amount;
    const platformFee = (transferAmount * 11) / 1000;
    console.log(platformFee);
    const totalTransferAmount = transferAmount + platformFee;
    const signer = wallet.connect(provider);

    try {
      const res = await this.aarcSDK.executeMigrationGasless({
        chainId: 137,
        senderSigner: signer,
        receiverAddress: smartAccountAddress,
        transferTokenDetails: [
          {
            tokenAddress: PolygonUSDCTokenAddress,
            // .toString(16) is to convert TOKEN_AMOUNT to hex in string format
            amount: ethers
              .parseUnits(totalTransferAmount.toString(), 6)
              .toString(),
          },
        ],
      });
      const taskId = res[0].taskId;
      console.log('res', res);
      console.log('taskId', taskId);
      return res[0].taskId;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  checkTransactionStatus = async (
    smartAccountAddress: string,
    amount: number,
    privateKey: string,
    alchemyMainnetRPC: string,
  ) => {
    try {
      const taskId = (await this.gaslessTransferToSmartAccount(
        smartAccountAddress,
        amount,
        privateKey,
        alchemyMainnetRPC,
      )) as string;
      let transactionStatus;
      // Define a function to check transaction status
      const getStatus: any = async () => {
        transactionStatus = await this.aarcSDK.getTransactionStatus(taskId);
        if (
          transactionStatus.data !== undefined &&
          transactionStatus.data.txStatus === 'CONFIRMED'
        ) {
          // If the transaction is confirmed, return the status
          console.log('status', transactionStatus);
          return transactionStatus;
        } else {
          // If the transaction is not confirmed, recursively call getStatus
          return await getStatus();
        }
      };
      // Call the getStatus function
      return await getStatus();
    } catch (error) {
      return error;
    }
  };
}
