import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AES, enc } from 'crypto-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CryptoService {
  private readonly key = undefined;
  constructor(configService: ConfigService) {
    this.key = configService.get<string>('PAYLOAD_SECRET_KEY');
  }
  async comparePassword(password: string | Buffer, passwordHash: string) {
    return bcrypt.compare(password, passwordHash);
  }
  async hashPassword(password: string | Buffer) {
    return await bcrypt.hash(password, 10);
  }
  async encryptObject(payload: object) {
    return AES.encrypt(JSON.stringify(payload), this.key).toString();
  }
  async decryptObject(payload: string) {
    const decryptedData = AES.decrypt(payload, this.key).toString(enc.Utf8);
    return JSON.parse(decryptedData);
  }
}
