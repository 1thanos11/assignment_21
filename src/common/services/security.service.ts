import { decrypt, encrypt } from "../utils/security/encryption.security.js";
import { compareHash, generateHash } from "../utils/security/hash.security.js";

export class SecurityService {
  constructor() {}
  public generateHash = generateHash;
  public compareHash = compareHash;

  public encrypt = encrypt;
  public decrypt = decrypt;
}
