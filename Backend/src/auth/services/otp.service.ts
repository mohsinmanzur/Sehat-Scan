import { Injectable, BadRequestException } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { randomInt } from 'crypto';
import * as argon2 from 'argon2';
import { v4 as uuid } from 'uuid';

type OtpRecord = {
  codeHash: string;
  challengeId: string;
  attempts: number;
  expiresAt: number; // epoch ms
};

@Injectable()
export class OtpService {
  constructor(@Inject('CACHE_MANAGER') private cache: Cache) {}

  private key(email: string) {
    return `otp:${email.toLowerCase()}`;
  }

  async create(email: string)
  {
    // 6-digit code with leading zeros allowed
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const codeHash = await argon2.hash(code);
    const challengeId = uuid();
    const rec: OtpRecord = {
      codeHash,
      challengeId,
      attempts: 0,
      expiresAt: Date.now() + 5 * 60_000, // 5 minutes
    };
    // set with TTL = 5 minutes (in milliseconds for cache-manager v5+)
    await this.cache.set(this.key(email), rec, 5 * 60 * 1000);
    return { code, challengeId, expiresAt: rec.expiresAt };
  }

  async verify(email: string, code: string | number, maxAttempts = 5)
  {
    const key = this.key(email);
    const rec = (await this.cache.get<OtpRecord>(key)) || null;

    // Generic failure (don't reveal which condition failed)
    const fail = async () => {
      if (rec) {
        rec.attempts += 1;
        await this.cache.set(key, rec, Math.max(1000, rec.expiresAt - Date.now()));
      }
      throw new BadRequestException('Invalid code or email.');
    };

    if (!rec || Date.now() > rec.expiresAt) {
      await this.cache.del(key);
      return fail();
    }
    if (rec.attempts >= maxAttempts) {
      await this.cache.del(key);
      return fail();
    }

    const ok = await argon2.verify(rec.codeHash, String(code));
    if (!ok) return fail();

    await this.cache.del(key);
    return { challengeId: rec.challengeId };
  }

  async invalidate(email: string) {
    await this.cache.del(this.key(email));
  }
}
