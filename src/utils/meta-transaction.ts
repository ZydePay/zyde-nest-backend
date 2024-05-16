// import { ConfigService } from '@nestjs/config';
// import { Injectable } from '@nestjs/common';
// import { ethers, parseUnits } from 'ethers';
// import metaABI from '../abis/meta.json';
// import USDTABI from '../abis/USDTPolygon.json';

// @Injectable()
// export class MetaTransaction {
//   private rpcUrl: string;
//   private provider: ethers.JsonRpcProvider;
//   private metaAddress: string;
//   private privateKey: string;
//   private signer: ethers.Wallet;
//   private usdtTokenAddress: string;

//   constructor(private readonly configService: ConfigService) {
//     this.rpcUrl = this.configService.get('ALCHEMY_MAINNET_URL');
//     this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
//     this.metaAddress = this.configService.get(
//       'GASLESS_TRANSACTION_SMART_CONTRACT',
//     );
//     this.privateKey = this.configService.get('PRIVATE_KEY');
//     this.signer = new ethers.Wallet(this.privateKey, this.provider);
//     this.usdtTokenAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'; // USDC Proxy address
//   }

//   async getPermitData(owner: string, spender: string, value: bigint) {
//     const usdcTokenContract = new ethers.Contract(
//       this.usdtTokenAddress,
//       USDTABI,
//       this.provider,
//     );

//     const name = await usdcTokenContract.name();
//     const chainId = await usdcTokenContract.getChainId();
//     const currentTimestamp = Math.floor(Date.now() / 1000);
//     const validityDuration = 24 * 60 * 60; // 1 day in seconds
//     const deadline = currentTimestamp + validityDuration;
//     const nonce = await this.provider.getTransactionCount(owner);

//     const permitData = {
//       types: {
//         Permit: [
//           { name: 'owner', type: 'address' },
//           { name: 'spender', type: 'address' },
//           { name: 'value', type: 'uint256' },
//           { name: 'nonce', type: 'uint256' },
//           { name: 'deadline', type: 'uint256' },
//         ],
//       },
//       domain: {
//         name: name,
//         version: '1',
//         chainId: chainId,
//         verifyingContract: await usdcTokenContract.getAddress(),
//       },
//       value: {
//         owner: owner,
//         spender: spender,
//         value: value,
//         nonce,
//         deadline,
//       },
//     };

//     return permitData;
//   }

//   async executeMetaTransaction(
//     owner: string,
//     receiver: string,
//     amount: bigint,
//   ) {
//     const metaContract = new ethers.Contract(
//       this.metaAddress,
//       metaABI.abi,
//       this.signer,
//     );

//     const usdtContract = new ethers.Contract(
//       this.usdtTokenAddress,
//       USDTABI,
//       this.signer,
//     );

//     const tokenAddress = await usdtContract.getAddress();
//     const feeAmount = (Number(amount) * 1) / 100;
//     const fee = parseInt(feeAmount.toString(), 6);

//     const { domain, types, value } = await this.getPermitData(
//       owner,
//       receiver,
//       amount,
//     );
//     const signature = await this.signer.signTypedData(domain, types, value);
//     const { v, r, s } = ethers.utils.splitSignature(signature);

//     const result = await metaContract.metaTransaction(
//       tokenAddress,
//       owner,
//       receiver,
//       parseUnits(amount.toString(), 6),
//       fee,
//       value.deadline,
//       v,
//       r,
//       s,
//     );

//     const tx = await result.wait();
//     console.log('Transaction successful!', tx);
//   }
// }
