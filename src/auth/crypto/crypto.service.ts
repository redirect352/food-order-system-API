import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  async comparePassword(password: string | Buffer, passwordHash: string) {
    return bcrypt.compare(password, passwordHash);
  }
  async hashPassword(password: string | Buffer) {
    return await bcrypt.hash(password, 10);
  }
}
