import { randomBytes, scryptSync } from 'crypto';

const encryptPassowrd = (password: string, salt: string) => {
    const saltRounds = Number(process.env.SALT_ROUNDS);
    let encryptedPass = password;

    for(let index = 0; index < saltRounds; index++) {
        encryptedPass = scryptSync(encryptedPass, salt, 32).toString('hex'); 
    }

  return encryptedPass;
};

export const hash = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  return encryptPassowrd(password, salt) + salt;
};

export const compare = (hash: string, passowrd: string): Boolean => {
  const salt = hash.slice(64);
  const originalPassHash = hash.slice(0, 64);
  const currentPassHash = encryptPassowrd(passowrd, salt);
  const isMatch = originalPassHash === currentPassHash;
  return isMatch;
};
