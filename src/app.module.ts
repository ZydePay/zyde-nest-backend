import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BiconomyGaslessWithViem } from './helpers/biconomy-with-viem';
import { AarcTransfer } from './utils/arc-gasless';
import { BiconomyTransferUsingEther } from './helpers/biconomy-gasless-with-ethers';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    BiconomyGaslessWithViem,
    AarcTransfer,
    BiconomyTransferUsingEther,
  ],
})
export class AppModule {}
