import { compare, genSalt, hash } from "bcrypt";
import { SALT_ROUND } from "../../../config/config.js";

//hash
export const generateHash = async ({
  data,
  rounds = SALT_ROUND,
}: {
  data: string;
  rounds?: number;
}): Promise<string> => {
  const salt = await genSalt(rounds);

  return await hash(data, salt);
};

//compare
export const compareHash = async ({
  plaintext,
  encrypted,
}: {
  plaintext: string;
  encrypted: string;
}): Promise<boolean> => {
  return await compare(plaintext, encrypted);
};
