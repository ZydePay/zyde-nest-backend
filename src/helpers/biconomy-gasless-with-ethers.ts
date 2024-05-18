import { ethers, parseUnits } from 'ethers';
import { PaymasterMode, createSmartAccountClient } from '@biconomy/account';
import { AarcTransfer } from '../utils/arc-gasless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BiconomyTransferUsingEther {
  constructor(
    private configService: ConfigService,
    private arcTransfer: AarcTransfer,
  ) {}

  alchemyMainnetRPC = this.configService.get('ALCHEMY_MAINNET_URL');
  biconomyPaymasterApiKey = this.configService.get('BICONOMY_API_KEY');
  bundlerUrl = this.configService.get('BICONOMY_POLYGON_MAINNET_BUNDLER'); // Found at https://dashboard.biconomy.io

  UsdtTokenAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'; // USDT Proxy address
  zydeContractAddress = '0x7Ff1a5Cf12353aee884156c4716B4D4181e502f2';

  createSmartAccount = async (privateKey: string) => {
    try {
      // Your configuration with private key and Biconomy API key
      const config = {
        privateKey: privateKey,
        biconomyPaymasterApiKey: this.biconomyPaymasterApiKey,
        bundlerUrl: this.bundlerUrl, // <-- Read about this at https://docs.biconomy.io/dashboard#bundler-url
        rpcUrl: this.alchemyMainnetRPC,
      };

      // Generate EOA from private key using ethers.js
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      const signer = new ethers.Wallet(config.privateKey, provider);

      // Create Biconomy Smart Account instance
      const smartWallet = await createSmartAccountClient({
        signer,
        biconomyPaymasterApiKey: config.biconomyPaymasterApiKey,
        bundlerUrl: config.bundlerUrl,
      });

      const saAddress = await smartWallet.getAccountAddress();
      console.log('SA Address', saAddress);
      return { smartWallet, saAddress };
    } catch (error) {
      return error;
    }
  };

  transferUSDT = async (
    amount: number,
    receipientAddress: string,
    privateKey: string,
  ) => {
    try {
      // amount to approve and transfer
      const transferAmount = amount;
      const fee = (transferAmount * 11) / 1000;
      console.log(fee);
      const totalApproveAmount = transferAmount + fee;

      const amountToTransfer = parseUnits(transferAmount.toString(), 6);
      const approvalAmount = parseUnits(totalApproveAmount.toString(), 6);

      // call the create smart contract function to get the smart account address
      const { smartWallet } = await this.createSmartAccount(privateKey);

      // batch transaction

      // usdt Approval Transaction
      const usdtAbi = new ethers.Interface([
        'function approve(address spender, uint256 amount)',
      ]);
      const zydeAbi = new ethers.Interface([
        'function transferERC20(address _recipient, uint256 _amount)',
      ]);

      const usdtData = usdtAbi.encodeFunctionData('approve', [
        this.zydeContractAddress,
        approvalAmount,
      ]);

      const zydeData = zydeAbi.encodeFunctionData('transferERC20', [
        receipientAddress,
        amountToTransfer,
      ]);

      // Build the transaction
      const usdtApprovalTx = {
        to: this.UsdtTokenAddress,
        data: usdtData,
      };

      // Build the transaction
      const zydeApprovalTx = {
        to: this.zydeContractAddress,
        data: zydeData,
      };

      // Send the transaction and get the transaction hash
      const userOpResponse = await smartWallet.sendTransaction(
        [usdtApprovalTx, zydeApprovalTx],
        {
          paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        },
      );
      const { transactionHash } = await userOpResponse.waitForTxHash();
      console.log('Transaction Hash', transactionHash);
      const userOpReceipt = await userOpResponse.wait();
      if (userOpReceipt.success == 'true') {
        console.log('UserOp receipt', userOpReceipt);
        console.log('Transaction receipt', userOpReceipt.receipt);
      }
      return transactionHash;
    } catch (error) {
      throw error;
    }
  };
}
