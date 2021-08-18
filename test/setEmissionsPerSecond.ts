import {
  Connection,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { TestAccounts } from "./setUpAccounts";
import { constructSetEmissionsPerSecondIx } from "../src/instructions";
import { AQUAFARM_PROGRAM_ID } from "./utils/constants";
import { u64 } from "@solana/spl-token";

export default async function setEmissionsPerSecond(
  connection: Connection,
  testAccounts: TestAccounts
) {
  const {
    ownerKeypair,
    emissionsAuthority,
    globalFarm,
    globalBaseTokenVaultPubkey,
  } = testAccounts;
  const transaction = new Transaction({ feePayer: ownerKeypair.publicKey });

  transaction.add(
    constructSetEmissionsPerSecondIx(
      emissionsAuthority.publicKey,
      globalFarm,
      globalBaseTokenVaultPubkey,
      AQUAFARM_PROGRAM_ID,
      new u64(500 * 1_000_000_000),
      new u64(1209600) // 2 weeks in seconds
    )
  );

  await sendAndConfirmTransaction(connection, transaction, [
    ownerKeypair,
    emissionsAuthority,
  ]);

  console.log(
    `SetEmissionsPerSecond: Modified global farm state with new emissions`
  );
}
