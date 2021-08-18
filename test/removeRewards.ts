import { u64 } from "@solana/spl-token";

import {
  Connection,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { AQUAFARM_PROGRAM_ID } from "./utils/constants";
import { TestAccounts } from "./setUpAccounts";
import { logTokenAccountBalances } from "./utils/accounts";
import { constructRemoveRewardsIx } from "../src/instructions";

export default async function removeRewards(
  connection: Connection,
  testAccounts: TestAccounts,
  amountToRemove = 400 // without the decimals
) {
  const {
    globalFarm,
    removeRewardsAuthority,
    globalRewardTokenVaultPubkey,
    aquafarmPda,
    destRewardAccountPubkey,
  } = testAccounts;

  const amountWithDecimals = new u64(amountToRemove * Math.pow(10, 9));

  console.log(`Amount to remove without decimals: ${amountToRemove}`);

  console.log(
    `Amount to remove with decimals: ${amountWithDecimals.toString()}`
  );

  const transaction = new Transaction({
    feePayer: removeRewardsAuthority.publicKey,
  });

  transaction.add(
    constructRemoveRewardsIx(
      globalFarm,
      removeRewardsAuthority.publicKey,
      destRewardAccountPubkey,
      globalRewardTokenVaultPubkey,
      aquafarmPda,
      AQUAFARM_PROGRAM_ID,
      amountWithDecimals
    )
  );

  async function logAmounts() {
    await logTokenAccountBalances(connection, [
      [destRewardAccountPubkey, "Remove Rewards Authority"],
      [testAccounts.globalRewardTokenVaultPubkey, "Remove Rewards Vault"],
    ]);
    console.log("");
  }

  console.log("PRE-TX BALANCES");
  await logAmounts();

  await sendAndConfirmTransaction(connection, transaction, [
    removeRewardsAuthority,
  ]);

  console.log("POST-TX BALANCES");
  await logAmounts();
}
