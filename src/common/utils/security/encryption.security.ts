import crypto from "node:crypto";
import { ENCRYPTION_SECRET_KEY, IV_LENGTH } from "../../../config/config.js";

//encrypt
export const encrypt = async ({
  plaintext,
}: {
  plaintext: string;
}): Promise<string> => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    iv,
  );
  let cipherText = cipher.update(plaintext, "utf-8", "hex");
  cipherText += cipher.final("hex");

  return `${iv.toString("hex")}:${cipherText}`;
};

//decrypt
export const decrypt = async ({
  encryptedData,
}: {
  encryptedData: string;
}): Promise<string> => {
  const [iv, cipherText] = encryptedData.split(":") as string[];
  if (!iv || !cipherText) {
    throw new Error("Invalid encrypted data format");
  }
  const binaryLikeIv = Buffer.from(iv, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    binaryLikeIv,
  );
  let plaintext = decipher.update(cipherText, "hex", "utf-8");
  plaintext += decipher.final("utf-8");

  return plaintext;
};
