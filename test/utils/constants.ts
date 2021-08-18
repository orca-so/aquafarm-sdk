import { PublicKey } from "@solana/web3.js";
import { getEnvVar } from "./env";

export const SOLANA_URL = getEnvVar("SOLANA_URL", "http://127.0.0.1:8899");

export const OWNER_KEYPATH = getEnvVar("ACCOUNT_PATH");

export const AQUAFARM_PROGRAM_ID = new PublicKey(
  getEnvVar("AQUAFARM_PROGRAM_ID")
);
