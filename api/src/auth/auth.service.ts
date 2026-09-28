import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'crypto';

export interface AuthResult {
  token: string;
  userId: string;
}

interface StoredCredential {
  salt: string;
  passwordHash: string;
}

@Injectable()
export class AuthService {
  private readonly credentials = new Map<string, StoredCredential>();
  private readonly userIds = new Map<string, string>();
  private readonly sessions = new Map<string, string>();

  register(username: string, password: string): AuthResult {
    if (this.credentials.has(username)) {
      throw new ConflictException('Username is already taken');
    }

    const salt = randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(salt, password);
    const userId = randomUUID();
    this.credentials.set(username, { salt, passwordHash });
    this.userIds.set(username, userId);

    return this.createSession(userId);
  }

  login(username: string, password: string): AuthResult {
    const credential = this.credentials.get(username);
    if (!credential || !this.passwordMatches(credential, password)) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return this.createSession(this.userIds.get(username)!);
  }

  loginAsGhost(): AuthResult {
    return this.createSession(randomUUID());
  }

  getUserIdForToken(token: string): string | undefined {
    return this.sessions.get(token);
  }

  private createSession(userId: string): AuthResult {
    const token = randomUUID();
    this.sessions.set(token, userId);
    return { token, userId };
  }

  private hashPassword(salt: string, password: string): string {
    return createHash('sha256').update(salt).update(password).digest('hex');
  }

  private passwordMatches(
    credential: StoredCredential,
    password: string,
  ): boolean {
    const actual = Buffer.from(this.hashPassword(credential.salt, password), 'hex');
    const expected = Buffer.from(credential.passwordHash, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }
}
