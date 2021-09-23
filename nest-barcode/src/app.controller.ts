import { Response, Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Post()
  sendBarcode(@Body() data) {
    console.log(data)
    return 'sent'
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
