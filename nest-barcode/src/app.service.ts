import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  sendBarcode(barcode: string): string {
    console.log(barcode)
    return 'sent'
  }
}
