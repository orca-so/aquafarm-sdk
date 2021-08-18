import { Token, u64 } from "@solana/spl-token";

import {
  Connection,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { logTokenAccountBalances } from "./utils/accounts";
import { TestAccounts } from "./setUpAccounts";

export default async function addRewards(
  connection: Connection,
  testAccounts: TestAccounts,
  amountToAdd = 500 // without the decimals
) {
  const {
    ownerKeypair,
    sourceRewardAccountPubkey,
    rewardTokenMint,
    globalRewardTokenVaultPubkey,
  } = testAccounts;

  const amountWithDecimals = new u64(amountToAdd * Math.pow(10, 9));

  console.log(`Amount with decimals: ${amountWithDecimals.toString()}`);
  const transaction = new Transaction({
    feePayer: ownerKeypair.publicKey,
  });

  transaction.add(
    Token.createTransferInstruction(
      rewardTokenMint.programId,
      sourceRewardAccountPubkey,
      globalRewardTokenVaultPubkey,
      ownerKeypair.publicKey,
      [],
      amountWithDecimals
    )
  );

  async function logAmounts() {
    await logTokenAccountBalances(connection, [
      [sourceRewardAccountPubkey, "Reward Authority"],
      [testAccounts.globalRewardTokenVaultPubkey, "Reward Vault"],
    ]);
    console.log("");
  }

  console.log("PRE-TX BALANCES");
  await logAmounts();

  await sendAndConfirmTransaction(connection, transaction, [
    ownerKeypair, // for approval
  ]);

  console.log("POST-TX BALANCES");
  await logAmounts();
}
