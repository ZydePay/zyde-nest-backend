import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateTransferDto } from './dtos/CreateUser.dto';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/transferUSDT')
  // @UsePipes(new ValidationPipe())
  async transferUSDT(@Body() data: CreateTransferDto) {
    return await this.appService.transferUSDT(data);
  }

  @Post('/transferUSDTEtherOption')
  // @UsePipes(new ValidationPipe())
  async transferUSDTEtherOption(@Body() data: CreateTransferDto) {
    return await this.appService.transferUSDTEtherOption(data);
  }
}
