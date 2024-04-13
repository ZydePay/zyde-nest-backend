import {
  Body,
  Controller,
  Get,
  Post
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateTransferDto } from './dtos/CreateUser.dto';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/transferUSDC')
  // @UsePipes(new ValidationPipe())
  async transferUSDC(@Body() data: CreateTransferDto) {
    return await this.appService.transferUSDC(data);
  }

  @Post('/transferUSDCEtherOption')
  // @UsePipes(new ValidationPipe())
  async transferUSDCEtherOption(@Body() data: CreateTransferDto) {
    return await this.appService.transferUSDCEtherOption(data);
  }
}
