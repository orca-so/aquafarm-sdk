import { u64 } from "@solana/spl-token";

import {
  Connection,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { GLOBAL_FARM_DATA_LAYOUT } from "../src/utils/layout";
import { TestAccounts } from "./setUpAccounts";
import { constructInitGlobalFarmIx } from "../src/instructions";
import { AQUAFARM_PROGRAM_ID } from "./utils/constants";

export default async function initGlobalFarm(
  connection: Connection,
  testAccounts: TestAccounts
) {
  const {
    ownerKeypair,
    emissionsAuthority,
    removeRewardsAuthority,
    baseTokenMint,
    globalBaseTokenVaultPubkey,
    farmTokenMint,
    globalRewardTokenVaultPubkey,
    globalFarm,
    nonce,
  } = testAccounts;

  const transaction = new Transaction({
    feePayer: ownerKeypair.publicKey,
  });

  transaction.add(
    constructInitGlobalFarmIx(
      globalFarm,
      baseTokenMint.publicKey,
      globalBaseTokenVaultPubkey,
      globalRewardTokenVaultPubkey,
      farmTokenMint.publicKey,
      emissionsAuthority.publicKey,
      removeRewardsAuthority.publicKey,
      new u64(0),
      new u64(1),
      nonce,
      AQUAFARM_PROGRAM_ID,
      ownerKeypair.publicKey
    )
  );

  // Are there any other required signers?
  const txid = await sendAndConfirmTransaction(connection, transaction, [
    ownerKeypair,
  ]);
  console.log("txid:", txid);

  console.log(
    "Created the globalFarmState account with pubkey:",
    globalFarm.toBase58()
  );

  return globalFarm;
}
