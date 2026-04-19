import crypto from "crypto";
import argon2 from "argon2";
import { PasswordService } from "../../application/ports/password.service";

export class Argon2PasswordService implements PasswordService {
  async hash(password: string): Promise<string> {
    const salt = crypto.randomBytes(16);
    return argon2.hash(password, { salt: salt });
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
