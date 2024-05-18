import { privateKeyToAccount } from 'viem/accounts';
import { polygon } from 'viem/chains';
import { createSmartAccountClient, PaymasterMode } from '@biconomy/account';
import {
  Hex,
  createWalletClient,
  encodeFunctionData,
  http,
  parseAbi,
  parseUnits,
} from 'viem';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
@Injectable()
export class BiconomyGaslessWithViem {
  constructor(private configService: ConfigService) {}

  alchemyMainnetRPC = this.configService.get('ALCHEMY_MAINNET_URL');
  biconomyPaymasterApiKey = this.configService.get('BICONOMY_API_KEY');
  bundlerUrl = this.configService.get('BICONOMY_POLYGON_MAINNET_BUNDLER'); // Found at https://dashboard.biconomy.io

  UsdtTokenAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'; // USDT Proxy address
  zydeContractAddress = '0x7Ff1a5Cf12353aee884156c4716B4D4181e502f2';
  // receipientAddress: string = '0xF8a485A3c7F0497e5de4Dde26cbefc1465499251';

  createSmartAccount = async (privateKey: string) => {
    try {
      // Your configuration with private key and Biconomy API key
      const config = {
        privateKey: privateKey,
        biconomyPaymasterApiKey: this.biconomyPaymasterApiKey,
        bundlerUrl: this.bundlerUrl, // <-- Read about this at https://docs.biconomy.io/dashboard#bundler-url
      };

      // Generate EOA from private key using ethers.js
      const account = privateKeyToAccount(`0x${privateKey}`);
      const client = createWalletClient({
        account,
        chain: polygon,
        transport: http(),
      });

      // Create Biconomy Smart Account instance
      const smartWallet = await createSmartAccountClient({
        signer: client,
        biconomyPaymasterApiKey: config.biconomyPaymasterApiKey,
        bundlerUrl: config.bundlerUrl,
      });

      const saAddress = await smartWallet.getAccountAddress();
      console.log('Smart Account Address', saAddress);
      return { smartWallet, saAddress };
    } catch (error) {
      return error;
    }
  };

  transferUSDT = async (
    amount: number,
    receipient: string,
    privateKey: string,
  ) => {
    try {
      // amount to approve and transfer
      const transferAmount = amount;
      const fee = (transferAmount * 11) / 1000;
      console.log('fee', fee);
      const totalApproveAmount = transferAmount + Number(fee);

      const amountToTransfer = parseUnits(transferAmount.toString(), 6);
      const approvalAmount = parseUnits(totalApproveAmount.toString(), 6);

      // call the create smart contract function to get the smart account address
      const { smartWallet } = await this.createSmartAccount(privateKey);
      // batch transaction

      // usdt Approval Transaction
      const erc20Abi = parseAbi([
        'function approve(address spender, uint256 amount)',
      ]);
      const zydeAbi = parseAbi([
        'function transferERC20(address _recipient, uint256 _amount)',
      ]);

      const usdtData = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [this.zydeContractAddress as Hex, approvalAmount],
      });

      const zydeData = encodeFunctionData({
        abi: zydeAbi,
        functionName: 'transferERC20',
        args: [receipient as Hex, amountToTransfer],
      });

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
      throw error.message;
    }
  };
}
