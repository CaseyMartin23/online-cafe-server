import { randomBytes, scryptSync } from 'crypto';

const encryptPassowrd = (password: string, salt: string) => {
    const saltRounds = Number(process.env.SALT_ROUNDS);
    let encryptedPass = password;

    for(let index = 0; index < saltRounds; index++) {
      const hashLength = Number(process.env.HASH_KEY_LENGTH) 
      encryptedPass = scryptSync(encryptedPass, salt, hashLength).toString('hex'); 
    }

  return encryptedPass;
};

export const hash = (password: string): string => {
  const saltLength = Number(process.env.SALT_BYTES)
  const salt = randomBytes(saltLength).toString('hex');
  return encryptPassowrd(password, salt) + salt;
};

export const compare = (hashedValue: string, rawValue: string): Boolean => {
  const originalPassLength = Number(process.env.ORIGINAL_SECRET_LENGTH);
  const salt = hashedValue.slice(originalPassLength);
  const originalPassHash = hashedValue.slice(0, originalPassLength);
  const currentPassHash = encryptPassowrd(rawValue, salt);
  const isMatch = originalPassHash === currentPassHash;
  return isMatch;
};
