import { PublicKey } from "@solana/web3.js";
import { u64 } from "@solana/spl-token";
import Decimal from "decimal.js";

export default class UserFarm {
  publicKey: PublicKey;
  isInitialized: boolean;
  owner: PublicKey;
  baseTokensConverted: u64;
  cumulativeEmissionsCheckpoint: Decimal;

  constructor(params: {
    publicKey: PublicKey;
    isInitialized: boolean;
    owner: PublicKey;
    baseTokensConverted: u64;
    cumulativeEmissionsCheckpoint: Decimal;
  }) {
    this.publicKey = params.publicKey;
    this.isInitialized = params.isInitialized;
    this.owner = params.owner;
    this.baseTokensConverted = params.baseTokensConverted;
    this.cumulativeEmissionsCheckpoint = params.cumulativeEmissionsCheckpoint;
  }

  toString() {
    return JSON.stringify(
      {
        publicKey: this.publicKey.toBase58(),
        isInitialized: this.isInitialized,
        owner: this.owner.toBase58(),
        baseTokensConverted: this.baseTokensConverted.toString(),
        cumulativeEmissionsCheckpoint:
          this.cumulativeEmissionsCheckpoint.toString(),
      },
      null,
      2
    );
  }
}

export async function getUserFarmAddress(
  globalFarm: PublicKey,
  owner: PublicKey,
  tokenProgramId: PublicKey,
  aquafarmProgramId: PublicKey
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [globalFarm.toBuffer(), owner.toBuffer(), tokenProgramId.toBuffer()],
    aquafarmProgramId
  );
}
